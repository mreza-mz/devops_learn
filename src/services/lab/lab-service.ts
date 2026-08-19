import { prisma } from "@/server/db/prisma";
import { dockerSandboxService } from "@/server/docker/docker-sandbox-service";
import { createLabToken } from "@/server/terminal/lab-token";
import { errors } from "@/lib/errors";
import { applyHintPenalty, scaleToWeight } from "@/services/scoring/scoring-engine";
import { progressEngine } from "@/services/progress/progress-engine";
import { aiService } from "@/server/ai/service";
import { ATTEMPT_STATUS } from "@/config/constants";
import type { Hint, LabSetup } from "@/types/domain";
import { getEnv } from "@/config/env";
import { learnerValidationFeedback } from "@/services/validation/validation-engine";

export const labService = {
  async startExerciseLab(userId: string, exerciseId: string) {
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) {
      throw errors.notFound("تمرین");
    }
    const existing = await prisma.lab.findFirst({
      where: { userId, exerciseId, status: "RUNNING" },
      orderBy: { createdAt: "desc" },
    });
    const lab =
      existing ??
      (await dockerSandboxService.createSandbox({
        userId,
        exerciseId,
        image: exercise.labImage,
        networkMode: exercise.networkMode,
        setup: (exercise.labSetupJson as LabSetup | null) ?? undefined,
      }));
    if (!lab.containerId) {
      throw errors.docker();
    }
    const token = await createLabToken({
      labId: lab.id,
      userId,
      containerId: lab.containerId,
    });
    await prisma.exerciseAttempt.create({
      data: { userId, exerciseId, status: ATTEMPT_STATUS.IN_PROGRESS, score: 0 },
    });
    return {
      lab,
      token,
      gatewayUrl: getEnv().NEXT_PUBLIC_TERMINAL_GATEWAY_URL,
      remainingSec: Math.max(0, Math.round((lab.expiresAt.getTime() - Date.now()) / 1000)),
    };
  },

  async startScenarioLab(userId: string, scenarioId: string) {
    const scenario = await prisma.productionScenario.findUnique({ where: { id: scenarioId } });
    if (!scenario) {
      throw errors.notFound("سناریو");
    }
    const lab = await dockerSandboxService.createSandbox({
      userId,
      scenarioId,
      image: scenario.labImage,
      networkMode: scenario.networkMode,
      setup: (scenario.labSetupJson as LabSetup | null) ?? undefined,
    });
    if (!lab.containerId) {
      throw errors.docker();
    }
    await prisma.scenarioAttempt.create({
      data: { userId, scenarioId, status: ATTEMPT_STATUS.IN_PROGRESS, score: 0 },
    });
    const token = await createLabToken({ labId: lab.id, userId, containerId: lab.containerId });
    return { lab, token, gatewayUrl: getEnv().NEXT_PUBLIC_TERMINAL_GATEWAY_URL };
  },

  async validateExercise(userId: string, labId: string, hintsUsed: number) {
    const lab = await prisma.lab.findUnique({ where: { id: labId }, include: { exercise: true } });
    if (!lab || lab.userId !== userId || !lab.exercise) {
      throw errors.notFound("آزمایشگاه");
    }
    const result = await dockerSandboxService.validateLab(labId, lab.exercise.validationJson);
    const settings = await prisma.settings.findUniqueOrThrow({ where: { id: "global" } });
    const base = (result.scorePercent / 100) * lab.exercise.maxScore;
    const score = applyHintPenalty(base, hintsUsed, lab.exercise.hintPenalty || settings.hintPenalty, lab.exercise.maxScore);
    const status = result.passed
      ? score >= lab.exercise.maxScore * 0.9
        ? ATTEMPT_STATUS.EXCELLENT
        : ATTEMPT_STATUS.PASSED
      : ATTEMPT_STATUS.FAILED;
    const ai = await aiService.gradePracticalExercise({
      instructionsMd: lab.exercise.instructionsMd,
      validationPassed: result.passed,
      scorePercent: result.scorePercent,
      details: result.results.filter((item) => !item.passed).map((item) => item.detail),
    });
    const feedbackFa = result.passed
      ? ai.feedbackFa
      : learnerValidationFeedback(result.results, false);
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        userId,
        exerciseId: lab.exercise.id,
        status,
        score,
        hintsUsed,
        validationResult: result.results,
        feedbackFa,
        completedAt: new Date(),
      },
    });
    if (lab.exercise.topicId) {
      await progressEngine.recordTopicScore(userId, lab.exercise.topicId, result.scorePercent);
    }
    if (lab.exercise.dailyLessonId) {
      await progressEngine.recalculateDay(userId, lab.exercise.dailyLessonId);
    }
    return { attempt, result, score, status, feedbackFa };
  },

  async validateScenario(userId: string, labId: string) {
    const lab = await prisma.lab.findUnique({ where: { id: labId }, include: { scenario: true } });
    if (!lab || lab.userId !== userId || !lab.scenario) {
      throw errors.notFound("آزمایشگاه");
    }
    const result = await dockerSandboxService.validateLab(labId, lab.scenario.validationJson);
    const score = scaleToWeight(result.scorePercent, lab.scenario.maxScore);
    const status = result.passed ? ATTEMPT_STATUS.PASSED : ATTEMPT_STATUS.FAILED;
    const attempt = await prisma.scenarioAttempt.create({
      data: {
        userId,
        scenarioId: lab.scenario.id,
        status,
        score,
        validationResult: result.results,
        feedbackFa: result.passed ? "حادثه برطرف شد." : "هنوز علت ریشه‌ای برطرف نشده است.",
        completedAt: new Date(),
      },
    });
    if (lab.scenario.dailyLessonId) {
      await progressEngine.recalculateDay(userId, lab.scenario.dailyLessonId);
    }
    return { attempt, result, score, status };
  },

  getHints(hintsJson: unknown, used: number): Hint[] {
    const hints = Array.isArray(hintsJson) ? (hintsJson as Hint[]) : [];
    return hints.filter((hint) => hint.level <= used).sort((a, b) => a.level - b.level);
  },
};
