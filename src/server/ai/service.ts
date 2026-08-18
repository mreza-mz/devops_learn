import { isAiConfigured } from "@/config/env";
import { logger } from "@/lib/logger";
import { AvalAIProvider } from "@/server/ai/avalai-provider";
import { FallbackAIProvider } from "@/server/ai/fallback-provider";
import type { AIProvider } from "@/server/ai/provider";
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
  generateLesson(topic: string, dayNumber: number) {
    return withFallback(
      (client) => client.generateLesson(topic, dayNumber),
      generatedLessonSchema,
      () => fallback.generateLesson(topic, dayNumber),
    );
  },
  generateExercise(topic: string, weakness?: string) {
    return withFallback(
      (client) => client.generateExercise(topic, weakness),
      generatedExerciseSchema,
      () => fallback.generateExercise(topic, weakness),
    );
  },
  generateScenario(topic: string) {
    return withFallback(
      (client) => client.generateScenario(topic),
      generatedScenarioSchema,
      () => fallback.generateScenario(topic),
    );
  },
  generateExam(topic: string, count: number) {
    return withFallback(
      (client) => client.generateExam(topic, count),
      generatedExamSchema,
      () => fallback.generateExam(topic, count),
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
  generateReviewExercise(topic: string, previousPrompt?: string) {
    return withFallback(
      (client) => client.generateReviewExercise(topic, previousPrompt),
      generatedExerciseSchema,
      () => fallback.generateReviewExercise(topic, previousPrompt),
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
