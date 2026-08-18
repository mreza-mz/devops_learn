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

export interface AIProvider {
  generateLesson(topic: string, dayNumber: number): Promise<GeneratedLesson>;
  generateExercise(topic: string, weakness?: string): Promise<GeneratedExercise>;
  generateScenario(topic: string): Promise<GeneratedScenario>;
  generateExam(topic: string, count: number): Promise<GeneratedExam>;
  gradeAnswer(input: GradeAnswerInput): Promise<AiGradeResult>;
  gradePracticalExercise(input: GradePracticalInput): Promise<AiGradeResult>;
  analyzeWeaknesses(performances: { topic: string; score: number }[]): Promise<WeaknessAnalysis>;
  generateReviewExercise(topic: string, previousPrompt?: string): Promise<GeneratedExercise>;
  generatePersonalizedPlan(input: {
    currentDay: number;
    weakTopics: string[];
    strongTopics: string[];
  }): Promise<PersonalizedPlan>;
}
