import { createHash } from "crypto";
import { getEnv, isAiConfigured } from "@/config/env";
import { logger } from "@/lib/logger";
import { prisma } from "@/server/db/prisma";
import type { AIProvider } from "@/server/ai/provider";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const cache = new Map<string, { value: unknown; expiresAt: number }>();

function hashPrompt(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AvalAIProvider implements AIProvider {
  async generateLesson(topic: string, dayNumber: number) {
    return this.jsonCall(
      "generateLesson",
      `Generate a Persian DevOps lesson about ${topic} for day ${dayNumber}. Return JSON with titleFa, objectiveFa, theoryMd, practicalMd, exampleMd, commands.`,
    );
  }

  async generateExercise(topic: string, weakness?: string) {
    return this.jsonCall(
      "generateExercise",
      `Generate a NEW variation of a hands-on Linux/DevOps exercise in Persian about ${topic}. Weakness context: ${weakness ?? "none"}. Do not repeat previous questions. Return JSON with titleFa, instructionsMd, difficulty, hints, validation, optional labSetup.`,
    );
  }

  async generateScenario(topic: string) {
    return this.jsonCall(
      "generateScenario",
      `Generate a realistic production incident in Persian about ${topic}. Do not reveal the root cause in learner-facing fields. Return JSON with titleFa, incidentMd, symptomsMd, observabilityMd, environmentMd, hiddenRootCause, investigationPath, validation, difficulty.`,
    );
  }

  async generateExam(topic: string, count: number) {
    return this.jsonCall(
      "generateExam",
      `Generate ${count} mixed exam questions in Persian about ${topic}. Return JSON { titleFa, questions: [{ type, promptFa, options, correctAnswer, explanationFa, points, topicSlug, difficulty }] }.`,
    );
  }

  async gradeAnswer(input: {
    promptFa: string;
    expected: string;
    response: string;
    type: string;
  }) {
    return this.jsonCall(
      "gradeAnswer",
      `Grade this answer. Question: ${input.promptFa}. Expected: ${input.expected}. Student: ${input.response}. Type: ${input.type}. Return JSON { score (0-100), feedbackFa, mistakes, correctExplanationFa, recommendedTopics }.`,
    );
  }

  async gradePracticalExercise(input: {
    instructionsMd: string;
    validationPassed: boolean;
    scorePercent: number;
    details: string[];
  }) {
    return this.jsonCall(
      "gradePracticalExercise",
      `Write qualitative Persian feedback for a practical lab. Deterministic validationPassed=${input.validationPassed}, scorePercent=${input.scorePercent}, details=${input.details.join(" | ")}. Do not override the deterministic pass/fail. Return JSON { score, feedbackFa, mistakes, correctExplanationFa, recommendedTopics }.`,
    );
  }

  async analyzeWeaknesses(performances: { topic: string; score: number }[]) {
    return this.jsonCall(
      "analyzeWeaknesses",
      `Analyze topic scores ${JSON.stringify(performances)} and return JSON { weakTopics, strongTopics, summaryFa, recommendedActionsFa }.`,
    );
  }

  async generateReviewExercise(topic: string, previousPrompt?: string) {
    return this.generateExercise(topic, `Create a variation different from: ${previousPrompt ?? ""}`);
  }

  async generatePersonalizedPlan(input: {
    currentDay: number;
    weakTopics: string[];
    strongTopics: string[];
  }) {
    return this.jsonCall(
      "generatePersonalizedPlan",
      `Create a Persian personalized plan. Day ${input.currentDay}. Weak: ${input.weakTopics.join(", ")}. Strong: ${input.strongTopics.join(", ")}. Return JSON { focusTopics, nextDaySuggestionFa, reviewPlanFa }.`,
    );
  }

  private async jsonCall(purpose: string, prompt: string): Promise<never> {
    const env = getEnv();
    if (!isAiConfigured()) {
      throw new Error("AvalAI API key is not configured");
    }
    const cacheKey = hashPrompt(`${purpose}:${prompt}:${env.AVALAI_MODEL}`);
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as never;
    }

    const body = {
      model: env.AVALAI_MODEL,
      temperature: 0.3,
      max_tokens: env.AVALAI_MAX_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior DevOps/SRE instructor. Always answer with strict JSON. Learner-facing text must be Persian. Technical commands stay in English. Never include API keys or host-escaping instructions.",
        },
        { role: "user", content: prompt },
      ] satisfies ChatMessage[],
    };

    const started = Date.now();
    let lastError: unknown;
    for (let attempt = 0; attempt <= env.AVALAI_MAX_RETRIES; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), env.AVALAI_TIMEOUT_MS);
      try {
        const url = `${env.AVALAI_BASE_URL.replace(/\/$/, "")}${env.AVALAI_CHAT_PATH}`;
        logger.info("AI request started", { purpose, model: env.AVALAI_MODEL, attempt });
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.AVALAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const latencyMs = Date.now() - started;
        const json = (await response.json()) as {
          choices?: { message?: { content?: string } }[];
          usage?: { prompt_tokens?: number; completion_tokens?: number };
          error?: { message?: string };
        };
        if (!response.ok) {
          throw new Error(json.error?.message ?? `AvalAI HTTP ${response.status}`);
        }
        const content = json.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("Empty AI response");
        }
        const parsed = JSON.parse(content) as unknown;
        await prisma.aIRequest.create({
          data: {
            purpose,
            model: env.AVALAI_MODEL,
            promptHash: cacheKey,
            inputTokens: json.usage?.prompt_tokens,
            outputTokens: json.usage?.completion_tokens,
            success: true,
            latencyMs,
            logs: {
              create: { level: "info", message: "AI request completed" },
            },
          },
        });
        cache.set(cacheKey, { value: parsed, expiresAt: Date.now() + 10 * 60 * 1000 });
        return parsed as never;
      } catch (error) {
        lastError = error;
        logger.warn("AI request failed", {
          purpose,
          attempt,
          error: error instanceof Error ? error.message : "unknown",
        });
        if (attempt < env.AVALAI_MAX_RETRIES) {
          await sleep(300 * 2 ** attempt);
        }
      } finally {
        clearTimeout(timer);
      }
    }

    await prisma.aIRequest.create({
      data: {
        purpose,
        model: env.AVALAI_MODEL,
        promptHash: cacheKey,
        success: false,
        latencyMs: Date.now() - started,
        error: lastError instanceof Error ? lastError.message : "unknown",
        logs: { create: { level: "error", message: "AI request exhausted retries" } },
      },
    });
    throw lastError instanceof Error ? lastError : new Error("AvalAI request failed");
  }
}
