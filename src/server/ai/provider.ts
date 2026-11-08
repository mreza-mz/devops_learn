import type { AiGradeResult } from "@/types/domain";

export type GeneratedLesson = {
  titleFa: string;
  objectiveFa: string;
  theoryMd: string;
  practicalMd: string;
  exampleMd: string;
  commands: string[];
};

export type GeneratedExercise = {
  titleFa: string;
  instructionsMd: string;
  difficulty: "easy" | "medium" | "hard";
  hints: { level: number; textFa: string }[];
  validation: { checks: unknown[] };
  labSetup?: { commands: string[] };
};

export type GeneratedScenario = {
  titleFa: string;
  incidentMd: string;
  symptomsMd: string;
  observabilityMd: string;
  environmentMd: string;
  hiddenRootCause: string;
  investigationPath: string[];
  validation: { checks: unknown[] };
  difficulty: "easy" | "medium" | "hard";
};

export type GeneratedExamQuestion = {
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "COMMAND" | "TROUBLESHOOTING" | "SCENARIO";
  promptFa: string;
  options?: string[];
  correctAnswer: string;
  explanationFa: string;
  points: number;
  topicSlug: string;
  difficulty: "easy" | "medium" | "hard";
};

export type GeneratedExam = {
  titleFa: string;
  questions: GeneratedExamQuestion[];
};

export type WeaknessAnalysis = {
  weakTopics: string[];
  strongTopics: string[];
  summaryFa: string;
  recommendedActionsFa: string[];
};

export type PersonalizedPlan = {
  focusTopics: string[];
  nextDaySuggestionFa: string;
  reviewPlanFa: string;
};

export type GradeAnswerInput = {
  promptFa: string;
  expected: string;
  response: string;
  type: string;
};

export type GradePracticalInput = {
  instructionsMd: string;
  validationPassed: boolean;
  scorePercent: number;
  details: string[];
};

export type TrackAiContext = {
  trackSlug?: string;
  trackTitleEn?: string;
  moduleSlug?: string;
  moduleTitleEn?: string;
  topicSlug?: string;
  lessonSlug?: string;
  language?: "fa" | "en";
};

export function formatTrackAiContext(ctx?: TrackAiContext): string {
  if (!ctx) return "Track: DevOps/SRE (default).";
  return [
    `Track: ${ctx.trackTitleEn ?? ctx.trackSlug ?? "unknown"}`,
    ctx.moduleTitleEn || ctx.moduleSlug ? `Module: ${ctx.moduleTitleEn ?? ctx.moduleSlug}` : null,
    ctx.topicSlug ? `Topic: ${ctx.topicSlug}` : null,
    ctx.lessonSlug ? `Lesson: ${ctx.lessonSlug}` : null,
    `Learner language: ${ctx.language ?? "fa"} (technical terms and code stay in English)`,
    "Teaching rule: use progressive hints; do not reveal full solutions immediately.",
  ]
    .filter(Boolean)
    .join(". ");
}

export interface AIProvider {
  generateLesson(topic: string, dayNumber: number, ctx?: TrackAiContext): Promise<GeneratedLesson>;
  generateExercise(topic: string, weakness?: string, ctx?: TrackAiContext): Promise<GeneratedExercise>;
  generateScenario(topic: string, ctx?: TrackAiContext): Promise<GeneratedScenario>;
  generateExam(topic: string, count: number, ctx?: TrackAiContext): Promise<GeneratedExam>;
  gradeAnswer(input: GradeAnswerInput, ctx?: TrackAiContext): Promise<AiGradeResult>;
  gradePracticalExercise(input: GradePracticalInput, ctx?: TrackAiContext): Promise<AiGradeResult>;
  analyzeWeaknesses(performances: { topic: string; score: number }[], ctx?: TrackAiContext): Promise<WeaknessAnalysis>;
  generateReviewExercise(topic: string, previousPrompt?: string, ctx?: TrackAiContext): Promise<GeneratedExercise>;
  generatePersonalizedPlan(
    input: {
      currentDay: number;
      weakTopics: string[];
      strongTopics: string[];
    },
    ctx?: TrackAiContext,
  ): Promise<PersonalizedPlan>;
}
