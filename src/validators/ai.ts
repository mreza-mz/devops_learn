import { z } from "zod";

export const generatedLessonSchema = z.object({
  titleFa: z.string().min(3),
  objectiveFa: z.string().min(3),
  theoryMd: z.string().min(20),
  practicalMd: z.string().min(10),
  exampleMd: z.string().min(10),
  commands: z.array(z.string()).default([]),
});

export const generatedExerciseSchema = z.object({
  titleFa: z.string().min(3),
  instructionsMd: z.string().min(10),
  difficulty: z.enum(["easy", "medium", "hard"]),
  hints: z
    .array(z.object({ level: z.number().int().min(1).max(3), textFa: z.string().min(3) }))
    .min(1)
    .max(3),
  validation: z.object({
    checks: z.array(z.record(z.string(), z.unknown())).min(1),
  }),
  labSetup: z.object({ commands: z.array(z.string()) }).optional(),
});

export const generatedScenarioSchema = z.object({
  titleFa: z.string().min(3),
  incidentMd: z.string().min(10),
  symptomsMd: z.string().min(10),
  observabilityMd: z.string().min(5),
  environmentMd: z.string().min(5),
  hiddenRootCause: z.string().min(5),
  investigationPath: z.array(z.string()).min(1),
  validation: z.object({
    checks: z.array(z.record(z.string(), z.unknown())).min(1),
  }),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const generatedExamQuestionSchema = z.object({
  type: z.enum([
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "SHORT_ANSWER",
    "COMMAND",
    "TROUBLESHOOTING",
    "SCENARIO",
  ]),
  promptFa: z.string().min(5),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  explanationFa: z.string().min(5),
  points: z.number().positive(),
  topicSlug: z.string().min(2),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const generatedExamSchema = z.object({
  titleFa: z.string().min(3),
  questions: z.array(generatedExamQuestionSchema).min(1),
});

export const aiGradeResultSchema = z.object({
  score: z.number().min(0).max(100),
  feedbackFa: z.string().min(3),
  mistakes: z.array(z.string()).default([]),
  correctExplanationFa: z.string().min(3),
  recommendedTopics: z.array(z.string()).default([]),
});

export const weaknessAnalysisSchema = z.object({
  weakTopics: z.array(z.string()),
  strongTopics: z.array(z.string()),
  summaryFa: z.string().min(3),
  recommendedActionsFa: z.array(z.string()),
});

export const personalizedPlanSchema = z.object({
  focusTopics: z.array(z.string()),
  nextDaySuggestionFa: z.string().min(3),
  reviewPlanFa: z.string().min(3),
});

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(32),
  password: z.string().min(6).max(128),
});

export const settingsUpdateSchema = z.object({
  passingScore: z.number().int().min(1).max(100),
  excellentScore: z.number().int().min(1).max(100),
  weaknessThreshold: z.number().min(0).max(1),
  hintPenalty: z.number().int().min(0).max(20),
  aiEnabled: z.boolean(),
  requireAiApproval: z.boolean(),
});
