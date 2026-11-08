import { isAiConfigured } from "@/config/env";
import { logger } from "@/lib/logger";
import { AvalAIProvider } from "@/server/ai/avalai-provider";
import { FallbackAIProvider } from "@/server/ai/fallback-provider";
import type { AIProvider, TrackAiContext } from "@/server/ai/provider";
import {
  aiGradeResultSchema,
  generatedExamSchema,
  generatedExerciseSchema,
  generatedLessonSchema,
  generatedScenarioSchema,
  personalizedPlanSchema,
  weaknessAnalysisSchema,
} from "@/validators/ai";

const fallback = new FallbackAIProvider();
const avalai = new AvalAIProvider();

function provider(): AIProvider {
  return isAiConfigured() ? avalai : fallback;
}

async function withFallback<T>(
  action: (client: AIProvider) => Promise<unknown>,
  schema: { parse: (value: unknown) => T },
  fallbackAction: () => Promise<T>,
): Promise<T> {
  try {
    const raw = await action(provider());
    return schema.parse(raw);
  } catch (error) {
    logger.warn("AI provider failed, using fallback", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return fallbackAction();
  }
}

export const aiService = {
  generateLesson(topic: string, dayNumber: number, ctx?: TrackAiContext) {
    return withFallback(
      (client) => client.generateLesson(topic, dayNumber, ctx),
      generatedLessonSchema,
      () => fallback.generateLesson(topic, dayNumber, ctx),
    );
  },
  generateExercise(topic: string, weakness?: string, ctx?: TrackAiContext) {
    return withFallback(
      (client) => client.generateExercise(topic, weakness, ctx),
      generatedExerciseSchema,
      () => fallback.generateExercise(topic, weakness, ctx),
    );
  },
  generateScenario(topic: string, ctx?: TrackAiContext) {
    return withFallback(
      (client) => client.generateScenario(topic, ctx),
      generatedScenarioSchema,
      () => fallback.generateScenario(topic, ctx),
    );
  },
  generateExam(topic: string, count: number, ctx?: TrackAiContext) {
    return withFallback(
      (client) => client.generateExam(topic, count, ctx),
      generatedExamSchema,
      () => fallback.generateExam(topic, count, ctx),
    );
  },
  gradeAnswer(...args: Parameters<AIProvider["gradeAnswer"]>) {
    return withFallback(
      (client) => client.gradeAnswer(...args),
      aiGradeResultSchema,
      () => fallback.gradeAnswer(...args),
    );
  },
  gradePracticalExercise(...args: Parameters<AIProvider["gradePracticalExercise"]>) {
    return withFallback(
      (client) => client.gradePracticalExercise(...args),
      aiGradeResultSchema,
      () => fallback.gradePracticalExercise(...args),
    );
  },
  analyzeWeaknesses(...args: Parameters<AIProvider["analyzeWeaknesses"]>) {
    return withFallback(
      (client) => client.analyzeWeaknesses(...args),
      weaknessAnalysisSchema,
      () => fallback.analyzeWeaknesses(...args),
    );
  },
  generateReviewExercise(topic: string, previousPrompt?: string, ctx?: TrackAiContext) {
    return withFallback(
      (client) => client.generateReviewExercise(topic, previousPrompt, ctx),
      generatedExerciseSchema,
      () => fallback.generateReviewExercise(topic, previousPrompt, ctx),
    );
  },
  generatePersonalizedPlan(...args: Parameters<AIProvider["generatePersonalizedPlan"]>) {
    return withFallback(
      (client) => client.generatePersonalizedPlan(...args),
      personalizedPlanSchema,
      () => fallback.generatePersonalizedPlan(...args),
    );
  },
};
