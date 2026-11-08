import { prisma } from "@/server/db/prisma";
import { ATTEMPT_STATUS } from "@/config/constants";
import { classifyScore, computeDailyTotal, scaleToWeight, xpForDailyResult } from "@/services/scoring/scoring-engine";
import { detectWeakTopics, updateTopicAverage } from "@/services/progress/weakness-engine";
import { uniqueOpenReviews } from "@/services/progress/review-queue";
import { canUnlockLevel, nextStreak } from "@/services/progress/level-engine";
import { aiService } from "@/server/ai/service";
import type { LevelRequirements } from "@/types/domain";
import { Prisma } from "@prisma/client";
import { trackService } from "@/services/tracks/track-service";

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
      include: { exercises: true, exam: true, scenario: true, phase: true, track: true },
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
      await this.applyXpAndStreak(userId, daily.trackId, classification);
      if (classification !== "failed") {
        await this.maybeAdvanceDay(userId, daily.trackId, daily.dayNumber);
      }
    }
    await this.refreshWeakTopics(userId, daily.trackId);
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
      const open = await prisma.reviewQueue.findFirst({
        where: { userId, topicId, completed: false },
        select: { id: true },
      });
      if (!open) {
        await prisma.reviewQueue.create({
          data: {
            userId,
            topicId,
            reason: "weak-topic",
            scheduledFor: new Date(),
          },
        });
      }
    } else {
      await prisma.reviewQueue.updateMany({
        where: { userId, topicId, completed: false },
        data: { completed: true },
      });
    }
  },

  async refreshWeakTopics(userId: string, trackId?: string) {
    const skills = await prisma.userSkill.findMany({
      where: { userId, ...(trackId ? { topic: { trackId } } : {}) },
      include: { topic: true },
    });
    const settings = await prisma.settings.findUniqueOrThrow({ where: { id: "global" } });
    const weak = detectWeakTopics(
      skills.map((item) => ({ topicId: item.topicId, topicSlug: item.topic.slug, scoreAvg: item.scoreAvg, sampleCount: item.sampleCount })),
      settings.weaknessThreshold,
    );
    return weak;
  },

  async applyXpAndStreak(userId: string, trackId: string, classification: "failed" | "passed" | "excellent") {
    const trackProgress = await trackService.ensureUserTrackProgress(userId, trackId);
    const streak = nextStreak(trackProgress.lastStudyDate, new Date(), trackProgress.streak);
    const xpGain = xpForDailyResult(classification);
    await prisma.userTrackProgress.update({
      where: { id: trackProgress.id },
      data: {
        xp: { increment: xpGain },
        streak,
        lastStudyDate: new Date(),
      },
    });
    await trackService.syncProfileMirror(userId, trackId);
    await this.unlockAchievements(userId, streak, trackId);
  },

  async maybeAdvanceDay(userId: string, trackId: string, completedDay: number) {
    const trackProgress = await trackService.ensureUserTrackProgress(userId, trackId);
    if (trackProgress.currentDayNumber === completedDay) {
      const next = await prisma.dailyLesson.findUnique({
        where: { trackId_dayNumber: { trackId, dayNumber: completedDay + 1 } },
      });
      if (next) {
        await prisma.userTrackProgress.update({
          where: { id: trackProgress.id },
          data: { currentDayNumber: completedDay + 1 },
        });
        await trackService.syncProfileMirror(userId, trackId);
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

  async unlockAchievements(userId: string, streak: number, trackId?: string) {
    const earned: string[] = [];
    if (streak >= 3) earned.push("streak-3");
    if (streak >= 7) earned.push("streak-7");
    const passedDays = await prisma.progress.count({
      where: {
        userId,
        status: { in: ["PASSED", "EXCELLENT"] },
        ...(trackId ? { dailyLesson: { trackId } } : {}),
      },
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

  async dashboard(userId: string, trackId: string) {
    const track = await prisma.track.findUniqueOrThrow({ where: { id: trackId } });
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { userId },
      include: { currentLevel: true, user: true, activeTrack: true },
    });
    const trackProgress = await trackService.ensureUserTrackProgress(userId, trackId);
    const daily = await prisma.dailyLesson.findUnique({
      where: { trackId_dayNumber: { trackId, dayNumber: trackProgress.currentDayNumber } },
      include: { phase: true, exercises: true, scenario: true, exam: true, lessons: true, track: true },
    });
    const progressRows = await prisma.progress.findMany({
      where: { userId, dailyLesson: { trackId } },
      include: { dailyLesson: { include: { phase: true } } },
      orderBy: { updatedAt: "desc" },
    });
    const skills = await prisma.userSkill.findMany({
      where: { userId, topic: { trackId } },
      include: { topic: true },
      orderBy: { scoreAvg: "asc" },
    });
    const reviewRows = await prisma.reviewQueue.findMany({
      where: { userId, completed: false, topic: { trackId } },
      include: { topic: true },
      orderBy: { scheduledFor: "asc" },
    });
    const reviews = uniqueOpenReviews(reviewRows).slice(0, 8);
    const examHistory = await prisma.examAttempt.findMany({
      where: { userId, completedAt: { not: null }, exam: { dailyLesson: { trackId } } },
      include: { exam: { include: { dailyLesson: true } } },
      orderBy: { completedAt: "desc" },
      take: 10,
    });
    const projects = await prisma.project.findMany({
      where: { OR: [{ trackId }, { trackId: null }] },
      include: { attempts: { where: { userId } }, tasks: true },
      orderBy: { order: "asc" },
    });
    const weekly = progressRows
      .filter((row) => row.updatedAt.getTime() > Date.now() - 7 * 86400000)
      .map((row) => ({ day: row.dailyLesson.dayNumber, score: row.totalScore }));
    const settings = await prisma.settings.findUniqueOrThrow({ where: { id: "global" } });
    const analysis = await aiService.analyzeWeaknesses(
      skills.map((item) => ({ topic: item.topic.titleFa, score: item.scoreAvg })),
      {
        trackSlug: track.slug,
        trackTitleEn: track.titleEn,
      },
    );
    const plan = await aiService.generatePersonalizedPlan(
      {
        currentDay: trackProgress.currentDayNumber,
        weakTopics: analysis.weakTopics,
        strongTopics: analysis.strongTopics,
      },
      {
        trackSlug: track.slug,
        trackTitleEn: track.titleEn,
        moduleSlug: daily?.phase.slug,
        moduleTitleEn: daily?.phase.titleEn,
      },
    );
    const completedLessons = progressRows.filter((row) => row.theoryCompleted).length;
    const trackExerciseIds = (
      await prisma.exercise.findMany({
        where: { dailyLesson: { trackId } },
        select: { id: true },
      })
    ).map((item) => item.id);
    const completedExercises = await prisma.exerciseAttempt.count({
      where: { userId, status: { in: ["PASSED", "EXCELLENT"] }, exerciseId: { in: trackExerciseIds } },
    });
    const trackScenarioIds = (
      await prisma.productionScenario.findMany({
        where: { dailyLesson: { trackId } },
        select: { id: true },
      })
    ).map((item) => item.id);
    const completedScenarios = await prisma.scenarioAttempt.count({
      where: { userId, status: { in: ["PASSED", "EXCELLENT"] }, scenarioId: { in: trackScenarioIds } },
    });
    const totalDays = await prisma.dailyLesson.count({ where: { trackId } });
    return {
      track,
      trackProgress,
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
      overallProgress: Math.round((completedLessons / Math.max(totalDays, 1)) * 100),
    };
  },
};

export type DashboardData = Prisma.PromiseReturnType<typeof progressEngine.dashboard>;
