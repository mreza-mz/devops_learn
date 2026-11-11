import { prisma } from "@/server/db/prisma";
import { errors } from "@/lib/errors";
import { progressEngine } from "@/services/progress/progress-engine";
import { gradeExamAnswers } from "@/services/exam/exam-engine";
import { ATTEMPT_STATUS } from "@/config/constants";
import { scaleToWeight } from "@/services/scoring/scoring-engine";
import { CONTENT_STATUS } from "@/config/constants";
import { aiService } from "@/server/ai/service";
import { generatedExerciseSchema } from "@/validators/ai";
import { validationSpecSchema } from "@/services/validation/validation-engine";
import { trackService } from "@/services/tracks/track-service";

export const learningService = {
  async getDay(trackId: string, dayNumber: number) {
    const daily = await prisma.dailyLesson.findUnique({
      where: { trackId_dayNumber: { trackId, dayNumber } },
      include: {
        track: true,
        phase: true,
        lessons: { include: { topic: true }, orderBy: { order: "asc" } },
        exercises: { orderBy: { createdAt: "asc" } },
        scenario: true,
        exam: { include: { questions: { orderBy: { order: "asc" } } } },
      },
    });
    if (!daily) {
      throw errors.notFound("درس روز");
    }
    return daily;
  },

  async getDayBySlug(trackSlug: string, dayNumber: number) {
    const track = await trackService.getBySlug(trackSlug);
    return this.getDay(track.id, dayNumber);
  },

  async listDaysWithProgress(userId: string, trackId: string) {
    const trackProgress = await trackService.getTrackProgress(userId, trackId);
    const days = await prisma.dailyLesson.findMany({
      where: { trackId },
      orderBy: { dayNumber: "asc" },
      include: { phase: true },
    });
    const progressRows = await prisma.progress.findMany({
      where: { userId, dailyLesson: { trackId } },
    });
    const byLessonId = new Map(progressRows.map((row) => [row.dailyLessonId, row]));

    const mapped = days.map((day) => {
      const progress = byLessonId.get(day.id) ?? null;
      //const unlocked = day.dayNumber <= trackProgress.currentDayNumber;
      const unlocked = true;
      return {
        id: day.id,
        dayNumber: day.dayNumber,
        titleFa: day.titleFa,
        objectiveFa: day.objectiveFa,
        phaseId: day.phase.id,
        phaseSlug: day.phase.slug,
        phaseTitleFa: day.phase.titleFa,
        phaseTitleEn: day.phase.titleEn,
        phaseOrder: day.phase.order,
        unlocked,
        isCurrent: day.dayNumber === trackProgress.currentDayNumber,
        status: progress?.status ?? null,
        totalScore: progress?.totalScore ?? 0,
        bestScore: progress?.bestScore ?? 0,
        latestScore: progress?.latestScore ?? 0,
        theoryScore: progress?.theoryScore ?? 0,
        practicalScore: progress?.practicalScore ?? 0,
        scenarioScore: progress?.scenarioScore ?? 0,
        examScore: progress?.examScore ?? 0,
      };
    });

    const phaseMap = new Map<
      string,
      {
        id: string;
        slug: string;
        titleFa: string;
        titleEn: string;
        order: number;
        days: typeof mapped;
      }
    >();

    for (const day of mapped) {
      const existing = phaseMap.get(day.phaseId);
      if (existing) {
        existing.days.push(day);
        continue;
      }
      phaseMap.set(day.phaseId, {
        id: day.phaseId,
        slug: day.phaseSlug,
        titleFa: day.phaseTitleFa,
        titleEn: day.phaseTitleEn,
        order: day.phaseOrder,
        days: [day],
      });
    }

    const phases = [...phaseMap.values()].sort((a, b) => a.order - b.order);

    return {
      currentDayNumber: trackProgress.currentDayNumber,
      days: mapped,
      phases,
    };
  },

  async completeTheory(userId: string, trackId: string, dayNumber: number) {
    const daily = await this.getDay(trackId, dayNumber);
    await progressEngine.markTheoryComplete(userId, daily.id, daily.theoryWeight);
    for (const lesson of daily.lessons) {
      await progressEngine.recordTopicScore(userId, lesson.topicId, 80);
    }
    return progressEngine.recalculateDay(userId, daily.id);
  },

  async submitExam(userId: string, examId: string, responses: Record<string, string>, timeSpentSec: number) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true, dailyLesson: true },
    });
    if (!exam) {
      throw errors.notFound("آزمون");
    }
    const graded = await gradeExamAnswers(exam.questions, responses);
    const status =
      graded.percent >= exam.passingScore
        ? graded.percent >= 90
          ? ATTEMPT_STATUS.EXCELLENT
          : ATTEMPT_STATUS.PASSED
        : ATTEMPT_STATUS.FAILED;
    const attempt = await prisma.examAttempt.create({
      data: {
        userId,
        examId,
        status,
        score: graded.percent,
        timeSpentSec,
        completedAt: new Date(),
        answers: {
          create: graded.answers.map((answer) => ({
            questionId: answer.questionId,
            response: answer.response,
            isCorrect: answer.isCorrect,
            score: answer.score,
            feedbackFa: answer.feedbackFa,
          })),
        },
      },
      include: { answers: true },
    });
    for (const question of exam.questions) {
      if (question.topicId) {
        const answer = graded.answers.find((item) => item.questionId === question.id);
        const percent = question.points === 0 ? 0 : ((answer?.score ?? 0) / question.points) * 100;
        await progressEngine.recordTopicScore(userId, question.topicId, percent);
      }
    }
    if (exam.dailyLessonId) {
      await progressEngine.recalculateDay(userId, exam.dailyLessonId);
    }
    return { attempt, graded, status, examScoreWeighted: scaleToWeight(graded.percent, exam.dailyLesson?.examWeight ?? 30) };
  },

  async createReviewExercise(userId: string, topicId: string) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { track: true, phase: true },
    });
    if (!topic) {
      throw errors.notFound("موضوع");
    }
    const generated = await aiService.generateReviewExercise(topic.slug, undefined, {
      trackSlug: topic.track.slug,
      trackTitleEn: topic.track.titleEn,
      moduleSlug: topic.phase.slug,
      moduleTitleEn: topic.phase.titleEn,
      topicSlug: topic.slug,
    });
    const parsed = generatedExerciseSchema.parse(generated);
    const validation = validationSpecSchema.parse(parsed.validation);
    const settings = await prisma.settings.findUniqueOrThrow({ where: { id: "global" } });
    const exercise = await prisma.exercise.create({
      data: {
        topicId,
        titleFa: parsed.titleFa,
        instructionsMd: parsed.instructionsMd,
        difficulty: parsed.difficulty,
        validationJson: validation,
        hintsJson: parsed.hints,
        labSetupJson: parsed.labSetup ?? undefined,
        aiGenerated: true,
        status: settings.requireAiApproval ? CONTENT_STATUS.PENDING_REVIEW : CONTENT_STATUS.APPROVED,
        maxScore: 6,
      },
    });
    await prisma.reviewQueue.updateMany({
      where: { userId, topicId, completed: false },
      data: { generatedExerciseId: exercise.id },
    });
    return exercise;
  },
};
