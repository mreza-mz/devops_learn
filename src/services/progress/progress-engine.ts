import { prisma } from "@/server/db/prisma";
import { ATTEMPT_STATUS } from "@/config/constants";
import { classifyScore, computeDailyTotal, scaleToWeight, xpForDailyResult } from "@/services/scoring/scoring-engine";
import { detectWeakTopics, updateTopicAverage } from "@/services/progress/weakness-engine";
import { canUnlockLevel, nextStreak } from "@/services/progress/level-engine";
import { aiService } from "@/server/ai/service";
import type { LevelRequirements } from "@/types/domain";
import { Prisma } from "@prisma/client";

export const progressEngine = {
  async getOrCreateDailyProgress(userId: string, dailyLessonId: string) {
    return prisma.progress.upsert({
      where: { userId_dailyLessonId: { userId, dailyLessonId } },
      update: {},
      create: { userId, dailyLessonId },
    });
  },

  async markTheoryComplete(userId: string, dailyLessonId: string, theoryWeight: number) {
    const progress = await this.getOrCreateDailyProgress(userId, dailyLessonId);
    return prisma.progress.update({
      where: { id: progress.id },
      data: { theoryCompleted: true, theoryScore: theoryWeight },
    });
  },

  async recalculateDay(userId: string, dailyLessonId: string) {
    const daily = await prisma.dailyLesson.findUniqueOrThrow({
      where: { id: dailyLessonId },
      include: { exercises: true, exam: true, scenario: true, phase: true },
    });
    const settings = await prisma.settings.findUniqueOrThrow({ where: { id: "global" } });
    const progress = await this.getOrCreateDailyProgress(userId, dailyLessonId);

    const exerciseAttempts = await prisma.exerciseAttempt.findMany({
      where: { userId, exerciseId: { in: daily.exercises.map((item) => item.id) }, completedAt: { not: null } },
    });
    const practicalPercent =
      daily.exercises.length === 0
        ? 0
        : daily.exercises.reduce((sum, exercise) => {
            const best = exerciseAttempts
              .filter((item) => item.exerciseId === exercise.id)
              .sort((a, b) => b.score - a.score)[0];
            return sum + (best ? (best.score / exercise.maxScore) * 100 : 0);
          }, 0) / daily.exercises.length;

    const scenarioAttempt = daily.scenario
      ? await prisma.scenarioAttempt.findFirst({
          where: { userId, scenarioId: daily.scenario.id, completedAt: { not: null } },
          orderBy: { score: "desc" },
        })
      : null;
    const examAttempt = daily.exam
      ? await prisma.examAttempt.findFirst({
          where: { userId, examId: daily.exam.id, completedAt: { not: null } },
          orderBy: { score: "desc" },
        })
      : null;

    const parts = {
      theory: progress.theoryCompleted ? daily.theoryWeight : 0,
      practical: scaleToWeight(practicalPercent, daily.practicalWeight),
      scenario: scenarioAttempt ? scaleToWeight((scenarioAttempt.score / (daily.scenario?.maxScore ?? 20)) * 100, daily.scenarioWeight) : 0,
      exam: examAttempt ? scaleToWeight(examAttempt.score, daily.examWeight) : 0,
    };
    const total = computeDailyTotal(parts);
    const classification = classifyScore(total, {
      passingScore: daily.passingScore || settings.passingScore,
      excellentScore: settings.excellentScore,
    });
    const status =
      classification === "failed"
        ? ATTEMPT_STATUS.FAILED
        : classification === "excellent"
          ? ATTEMPT_STATUS.EXCELLENT
          : ATTEMPT_STATUS.PASSED;

    const updated = await prisma.progress.update({
      where: { id: progress.id },
      data: {
        theoryScore: parts.theory,
        practicalScore: parts.practical,
        scenarioScore: parts.scenario,
        examScore: parts.exam,
        totalScore: total,
        latestScore: total,
        bestScore: Math.max(progress.bestScore, total),
        status: parts.exam === 0 && parts.practical === 0 ? ATTEMPT_STATUS.IN_PROGRESS : status,
      },
    });

    if ((parts.exam > 0 || parts.practical > 0 || parts.scenario > 0) && total > 0) {
      await this.applyXpAndStreak(userId, classification);
      if (classification !== "failed") {
        await this.maybeAdvanceDay(userId, daily.dayNumber);
      }
    }
    await this.refreshWeakTopics(userId);
    await this.maybeUnlockLevel(userId);
    return updated;
  },

  async recordTopicScore(userId: string, topicId: string, scorePercent: number) {
    const existing = await prisma.userSkill.findUnique({
      where: { userId_topicId: { userId, topicId } },
    });
    const next = updateTopicAverage(existing?.scoreAvg ?? 0, existing?.sampleCount ?? 0, scorePercent / 100);
    const settings = await prisma.settings.findUniqueOrThrow({ where: { id: "global" } });
    const isWeak = next.scoreAvg < settings.weaknessThreshold;
    await prisma.userSkill.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { ...next, lastScore: scorePercent / 100, isWeak },
      create: { userId, topicId, ...next, lastScore: scorePercent / 100, isWeak },
    });
    if (isWeak) {
      await prisma.reviewQueue.create({
        data: {
          userId,
          topicId,
          reason: "weak-topic",
          scheduledFor: new Date(),
        },
      });
    }
  },

  async refreshWeakTopics(userId: string) {
    const skills = await prisma.userSkill.findMany({ where: { userId }, include: { topic: true } });
    const settings = await prisma.settings.findUniqueOrThrow({ where: { id: "global" } });
    const weak = detectWeakTopics(
      skills.map((item) => ({ topicId: item.topicId, topicSlug: item.topic.slug, scoreAvg: item.scoreAvg, sampleCount: item.sampleCount })),
      settings.weaknessThreshold,
    );
    return weak;
  },

  async applyXpAndStreak(userId: string, classification: "failed" | "passed" | "excellent") {
    const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
    const streak = nextStreak(profile.lastStudyDate, new Date(), profile.streak);
    await prisma.profile.update({
      where: { userId },
      data: {
        xp: { increment: xpForDailyResult(classification) },
        streak,
        lastStudyDate: new Date(),
      },
    });
    await this.unlockAchievements(userId, streak);
  },

  async maybeAdvanceDay(userId: string, completedDay: number) {
    const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
    if (profile.currentDayNumber === completedDay) {
      const next = await prisma.dailyLesson.findUnique({ where: { dayNumber: completedDay + 1 } });
      if (next) {
        await prisma.profile.update({
          where: { userId },
          data: { currentDayNumber: completedDay + 1 },
        });
      }
    }
  },

  async maybeUnlockLevel(userId: string) {
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { userId },
      include: { currentLevel: true },
    });
    const levels = await prisma.level.findMany({ orderBy: { order: "asc" } });
    const examAttempts = await prisma.examAttempt.findMany({ where: { userId, completedAt: { not: null } } });
    const practical = await prisma.exerciseAttempt.findMany({ where: { userId, completedAt: { not: null } } });
    const scenarios = await prisma.scenarioAttempt.findMany({ where: { userId, completedAt: { not: null } } });
    const projects = await prisma.projectAttempt.findMany({ where: { userId, status: { in: ["PASSED", "EXCELLENT"] } } });
    const weakCount = await prisma.userSkill.count({ where: { userId, isWeak: true } });
    const examAverage =
      examAttempts.length === 0 ? 0 : examAttempts.reduce((sum, item) => sum + item.score, 0) / examAttempts.length / 100;
    const practicalSuccessRate =
      practical.length === 0 ? 0 : practical.filter((item) => item.status !== "FAILED").length / practical.length;
    const stats = {
      examAverage,
      practicalSuccessRate,
      scenariosPassed: scenarios.filter((item) => item.status !== "FAILED").length,
      projectsCompleted: new Set(projects.map((item) => item.projectId)).size,
      streak: profile.streak,
      weakTopicCount: weakCount,
      currentLevelOrder: profile.currentLevel?.order ?? 0,
      xp: profile.xp,
    };
    let unlocked = profile.currentLevel;
    for (const level of levels) {
      const requirements = level.requirements as LevelRequirements;
      if (canUnlockLevel(stats, requirements, level.minXp)) {
        unlocked = level;
      }
    }
    if (unlocked && unlocked.id !== profile.currentLevelId) {
      await prisma.profile.update({
        where: { userId },
        data: { currentLevelId: unlocked.id },
      });
    }
  },

  async unlockAchievements(userId: string, streak: number) {
    const earned: string[] = [];
    if (streak >= 3) earned.push("streak-3");
    if (streak >= 7) earned.push("streak-7");
    const passedDays = await prisma.progress.count({
      where: { userId, status: { in: ["PASSED", "EXCELLENT"] } },
    });
    if (passedDays >= 1) earned.push("first-pass");
    if (passedDays >= 7) earned.push("week-complete");
    for (const slug of earned) {
      const achievement = await prisma.achievement.findUnique({ where: { slug } });
      if (!achievement) continue;
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
        update: {},
        create: { userId, achievementId: achievement.id },
      });
    }
  },

  async dashboard(userId: string) {
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { userId },
      include: { currentLevel: true, user: true },
    });
    const daily = await prisma.dailyLesson.findUnique({
      where: { dayNumber: profile.currentDayNumber },
      include: { phase: true, exercises: true, scenario: true, exam: true, lessons: true },
    });
    const progressRows = await prisma.progress.findMany({
      where: { userId },
      include: { dailyLesson: { include: { phase: true } } },
      orderBy: { updatedAt: "desc" },
    });
    const skills = await prisma.userSkill.findMany({
      where: { userId },
      include: { topic: true },
      orderBy: { scoreAvg: "asc" },
    });
    const reviews = await prisma.reviewQueue.findMany({
      where: { userId, completed: false },
      include: { topic: true },
      orderBy: { scheduledFor: "asc" },
      take: 8,
    });
    const examHistory = await prisma.examAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      include: { exam: { include: { dailyLesson: true } } },
      orderBy: { completedAt: "desc" },
      take: 10,
    });
    const projects = await prisma.project.findMany({
      include: { attempts: { where: { userId } }, tasks: true },
      orderBy: { order: "asc" },
    });
    const weekly = progressRows
      .filter((row) => row.updatedAt.getTime() > Date.now() - 7 * 86400000)
      .map((row) => ({ day: row.dailyLesson.dayNumber, score: row.totalScore }));
    const settings = await prisma.settings.findUniqueOrThrow({ where: { id: "global" } });
    const analysis = await aiService.analyzeWeaknesses(
      skills.map((item) => ({ topic: item.topic.titleFa, score: item.scoreAvg })),
    );
    const plan = await aiService.generatePersonalizedPlan({
      currentDay: profile.currentDayNumber,
      weakTopics: analysis.weakTopics,
      strongTopics: analysis.strongTopics,
    });
    const completedLessons = progressRows.filter((row) => row.theoryCompleted).length;
    const completedExercises = await prisma.exerciseAttempt.count({
      where: { userId, status: { in: ["PASSED", "EXCELLENT"] } },
    });
    const completedScenarios = await prisma.scenarioAttempt.count({
      where: { userId, status: { in: ["PASSED", "EXCELLENT"] } },
    });
    return {
      profile,
      daily,
      progressRows,
      skills,
      reviews,
      examHistory,
      projects,
      weekly,
      analysis,
      plan,
      settings,
      completedLessons,
      completedExercises,
      completedScenarios,
      overallProgress: Math.round((completedLessons / Math.max(progressRows.length, 7)) * 100),
    };
  },
};

export type DashboardData = Prisma.PromiseReturnType<typeof progressEngine.dashboard>;
