import { prisma } from "@/server/db/prisma";
import { aiService } from "@/server/ai/service";
import { errors } from "@/lib/errors";
import { TRACK_SLUGS } from "@/config/tracks";
import {
  getInterviewQuestion,
  INTERVIEW_CATEGORY_LABELS,
  INTERVIEW_LESSON_BY_CATEGORY,
  INTERVIEW_MODE_COUNTS,
  INTERVIEW_QUESTION_BANK,
  type InterviewCategory,
  type InterviewMode,
  type InterviewQuestion,
} from "@/config/interview-bank";

const STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

const CATEGORY_ORDER: InterviewCategory[] = [
  "go-fundamentals",
  "concurrency",
  "algorithms",
  "database",
  "system-design",
  "backend",
  "problem-solving",
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickQuestions(mode: InterviewMode): string[] {
  const count = INTERVIEW_MODE_COUNTS[mode];
  const byCategory = new Map<InterviewCategory, InterviewQuestion[]>();
  for (const category of CATEGORY_ORDER) {
    byCategory.set(category, []);
  }
  for (const question of INTERVIEW_QUESTION_BANK) {
    byCategory.get(question.category)?.push(question);
  }

  const perCategory = Math.max(1, Math.floor(count / CATEGORY_ORDER.length));
  const selected: InterviewQuestion[] = [];
  for (const category of CATEGORY_ORDER) {
    const pool = shuffle(byCategory.get(category) ?? []);
    selected.push(...pool.slice(0, perCategory));
  }

  const remaining = shuffle(
    INTERVIEW_QUESTION_BANK.filter((q) => !selected.some((s) => s.id === q.id)),
  );
  while (selected.length < count && remaining.length > 0) {
    const next = remaining.pop();
    if (next) selected.push(next);
  }

  return shuffle(selected.slice(0, count)).map((q) => q.id);
}

function assertBackendTrack(trackSlug: string) {
  if (trackSlug !== TRACK_SLUGS.BACKEND_GO) {
    throw errors.forbidden();
  }
}

export const interviewService = {
  async startSession(userId: string, trackSlug: string, mode: InterviewMode) {
    assertBackendTrack(trackSlug);
    if (!(mode in INTERVIEW_MODE_COUNTS)) {
      throw errors.validation("حالت مصاحبه معتبر نیست.");
    }
    const track = await prisma.track.findUnique({ where: { slug: trackSlug } });
    if (!track) {
      throw errors.notFound("مسیر");
    }
    const questionIds = pickQuestions(mode);
    const session = await prisma.interviewSession.create({
      data: {
        userId,
        trackId: track.id,
        mode,
        status: STATUS.IN_PROGRESS,
        questionIdsJson: questionIds,
        currentIndex: 0,
      },
    });
    return session;
  },

  async getSession(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { answers: { orderBy: { orderIndex: "asc" } }, track: { select: { slug: true } } },
    });
    if (!session || session.userId !== userId) {
      throw errors.notFound("جلسه مصاحبه");
    }
    return session;
  },

  getQuestionIds(session: { questionIdsJson: unknown }): string[] {
    if (!Array.isArray(session.questionIdsJson)) {
      return [];
    }
    return session.questionIdsJson.filter((id): id is string => typeof id === "string");
  },

  getCurrentQuestion(session: {
    questionIdsJson: unknown;
    currentIndex: number;
    answers: { orderIndex: number }[];
  }): { question: InterviewQuestion; index: number; total: number } | null {
    const ids = this.getQuestionIds(session);
    const index = session.answers.length;
    if (index >= ids.length) {
      return null;
    }
    const question = getInterviewQuestion(ids[index]);
    if (!question) {
      throw errors.validation("سؤال بانک پیدا نشد.");
    }
    return { question, index, total: ids.length };
  },

  async submitAnswer(userId: string, sessionId: string, answerText: string) {
    const trimmed = answerText.trim();
    if (!trimmed) {
      throw errors.validation("پاسخ خالی قابل قبول نیست.");
    }

    const session = await this.getSession(userId, sessionId);
    if (session.status !== STATUS.IN_PROGRESS) {
      throw errors.validation("این جلسه قبلاً پایان یافته است.");
    }

    const ids = this.getQuestionIds(session);
    const orderIndex = session.answers.length;
    if (orderIndex >= ids.length) {
      throw errors.validation("همهٔ سؤالات پاسخ داده شده‌اند.");
    }

    const questionId = ids[orderIndex];
    const question = getInterviewQuestion(questionId);
    if (!question) {
      throw errors.validation("سؤال نامعتبر است.");
    }

    const expected = `${question.rubricFa}\nنکات کلیدی: ${question.expectedPoints.join("؛ ")}`;
    const grade = await aiService.gradeAnswer(
      {
        promptFa: question.promptFa,
        expected,
        response: trimmed,
        type: "SHORT_ANSWER",
      },
      { trackSlug: session.track.slug },
    );

    let followUpFa: string | null = null;
    if (grade.score < 75) {
      const followUp = await aiService.gradeAnswer(
        {
          promptFa: `سؤال پیگیری برای عمیق‌تر کردن پاسخ: ${question.promptFa}`,
          expected: "یک سؤال پیگیری کوتاه فارسی بپرسید که داوطلب نقطهٔ ضعف را روشن کند.",
          response: trimmed,
          type: "SHORT_ANSWER",
        },
        { trackSlug: session.track.slug },
      );
      followUpFa = followUp.correctExplanationFa || followUp.feedbackFa;
    }

    const answer = await prisma.interviewAnswer.create({
      data: {
        sessionId,
        questionId,
        orderIndex,
        answerText: trimmed,
        score: grade.score,
        feedbackFa: grade.feedbackFa,
        mistakesJson: grade.mistakes,
        followUpFa,
      },
    });

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { currentIndex: orderIndex + 1 },
    });

    return {
      answer,
      question,
      grade,
      followUpFa,
      remaining: ids.length - orderIndex - 1,
      completed: orderIndex + 1 >= ids.length,
    };
  },

  async finishSession(userId: string, sessionId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { answers: true, track: { select: { slug: true } } },
    });
    if (!session || session.userId !== userId) {
      throw errors.notFound("جلسه مصاحبه");
    }

    const ids = this.getQuestionIds(session);
    if (session.answers.length < ids.length) {
      throw errors.validation("هنوز همهٔ سؤالات پاسخ داده نشده‌اند.");
    }
    if (session.status === STATUS.COMPLETED && session.overallScore != null) {
      const categoryScores =
        session.categoryScoresJson && typeof session.categoryScoresJson === "object"
          ? (session.categoryScoresJson as Record<string, number>)
          : {};
      return {
        session,
        analysis: {
          weakTopics: Array.isArray(session.weaknessesJson) ? (session.weaknessesJson as string[]) : [],
          strongTopics: Array.isArray(session.strengthsJson) ? (session.strengthsJson as string[]) : [],
          summaryFa: session.reportSummaryFa ?? "",
          recommendedActionsFa: [],
        },
        recommendedLessons: Array.isArray(session.recommendedLessonsJson)
          ? (session.recommendedLessonsJson as { dayNumber: number; labelFa: string }[])
          : [],
        categoryScores,
        overallScore: session.overallScore,
      };
    }

    const categoryScores: Record<string, { sum: number; count: number }> = {};
    for (const ans of session.answers) {
      const q = getInterviewQuestion(ans.questionId);
      if (!q) continue;
      const bucket = categoryScores[q.category] ?? { sum: 0, count: 0 };
      bucket.sum += ans.score;
      bucket.count += 1;
      categoryScores[q.category] = bucket;
    }

    const categoryPerformances = Object.entries(categoryScores).map(([category, data]) => ({
      topic: INTERVIEW_CATEGORY_LABELS[category as InterviewCategory] ?? category,
      score: data.count ? data.sum / data.count / 100 : 0,
    }));

    const analysis = await aiService.analyzeWeaknesses(categoryPerformances, {
      trackSlug: session.track.slug,
    });

    const normalizedCategoryScores: Record<string, number> = {};
    for (const [cat, data] of Object.entries(categoryScores)) {
      normalizedCategoryScores[cat] = data.count ? Math.round(data.sum / data.count) : 0;
    }

    const overall =
      session.answers.length > 0
        ? session.answers.reduce((acc, a) => acc + a.score, 0) / session.answers.length
        : 0;

    const weakCategories = Object.entries(normalizedCategoryScores)
      .filter(([, score]) => score < 70)
      .map(([cat]) => cat as InterviewCategory);

    const recommendedLessons = [...new Set(weakCategories.map((c) => INTERVIEW_LESSON_BY_CATEGORY[c]))];

    const updated = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: STATUS.COMPLETED,
        completedAt: new Date(),
        overallScore: overall,
        categoryScoresJson: normalizedCategoryScores,
        strengthsJson: analysis.strongTopics,
        weaknessesJson: analysis.weakTopics,
        recommendedLessonsJson: recommendedLessons,
        reportSummaryFa: analysis.summaryFa,
      },
    });

    return {
      session: updated,
      analysis,
      recommendedLessons,
      categoryScores: normalizedCategoryScores,
      overallScore: overall,
    };
  },
};
