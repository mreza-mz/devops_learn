import type { AiGradeResult } from "@/types/domain";
import type {
  AIProvider,
  GeneratedExam,
  GeneratedExercise,
  GeneratedLesson,
  GeneratedScenario,
  PersonalizedPlan,
  TrackAiContext,
  WeaknessAnalysis,
} from "@/server/ai/provider";

export class FallbackAIProvider implements AIProvider {
  async generateLesson(topic: string, dayNumber: number, ctx?: TrackAiContext): Promise<GeneratedLesson> {
    void ctx;
    return {
      titleFa: `مرور ${topic}`,
      objectiveFa: `آشنایی بیشتر با ${topic} در روز ${dayNumber}`,
      theoryMd: `هوش مصنوعی در دسترس نیست. موضوع ${topic} را از درس‌های موجود مرور کنید.`,
      practicalMd: "از تمرین‌های ذخیره‌شده در برنامه استفاده کنید.",
      exampleMd: "مثال آفلاین در محتوای seed موجود است.",
      commands: [],
    };
  }

  async generateExercise(topic: string, weakness?: string, ctx?: TrackAiContext): Promise<GeneratedExercise> {
    void ctx;
    return {
      titleFa: `تمرین مرور ${topic}`,
      instructionsMd: `یک فایل به نام /tmp/review-${topic}.txt بسازید و داخل آن نام موضوع را بنویسید.${weakness ? ` تمرکز: ${weakness}` : ""}`,
      difficulty: "easy",
      hints: [
        { level: 1, textFa: "از touch یا echo استفاده کنید." },
        { level: 2, textFa: "دستور echo متن > فایل را به کار ببرید." },
        { level: 3, textFa: `echo ${topic} > /tmp/review-${topic}.txt` },
      ],
      validation: {
        checks: [{ type: "fileExists", path: `/tmp/review-${topic}.txt` }],
      },
    };
  }

  async generateScenario(topic: string, ctx?: TrackAiContext): Promise<GeneratedScenario> {
    void ctx;
    return {
      titleFa: `سناریوی آفلاین ${topic}`,
      incidentMd: "سرویس کند شده است. علت را با ابزارهای استاندارد بررسی کنید.",
      symptomsMd: "بار CPU بالا و پاسخ‌دهی کند.",
      observabilityMd: "ps, top, free, df در دسترس هستند.",
      environmentMd: "یک سرور لینوکس ایزوله.",
      hiddenRootCause: "فرآیند مصرف‌کننده CPU",
      investigationPath: ["top", "ps", "kill"],
      validation: { checks: [{ type: "commandExitCode", command: "true", expected: 0 }] },
      difficulty: "medium",
    };
  }

  async generateExam(topic: string, count: number, ctx?: TrackAiContext): Promise<GeneratedExam> {
    void ctx;
    return {
      titleFa: `آزمون مرور ${topic}`,
      questions: Array.from({ length: count }, (_, index) => ({
        type: "TRUE_FALSE" as const,
        promptFa: `موضوع ${topic} برای کار عملی DevOps اهمیت دارد. (${index + 1})`,
        options: ["درست", "نادرست"],
        correctAnswer: "درست",
        explanationFa: "این موضوع بخشی از مسیر یادگیری است.",
        points: 3,
        topicSlug: topic,
        difficulty: "easy" as const,
      })),
    };
  }

  async gradeAnswer(
    input: {
      promptFa: string;
      expected: string;
      response: string;
      type: string;
    },
    ctx?: TrackAiContext,
  ): Promise<AiGradeResult> {
    void ctx;
    const normalized = normalize(input.response);
    const expected = normalize(input.expected);
    const correct =
      input.type === "SHORT_ANSWER" || input.type === "COMMAND"
        ? normalized.includes(expected) || expected.includes(normalized)
        : normalized === expected;
    return {
      score: correct ? 100 : 0,
      feedbackFa: correct ? "پاسخ درست است." : "پاسخ با کلید نمره هم‌خوانی ندارد.",
      mistakes: correct ? [] : ["با پاسخ مورد انتظار مطابقت ندارد."],
      correctExplanationFa: `پاسخ مورد انتظار: ${input.expected}`,
      recommendedTopics: [],
    };
  }

  async gradePracticalExercise(
    input: {
      instructionsMd: string;
      validationPassed: boolean;
      scorePercent: number;
      details: string[];
    },
    ctx?: TrackAiContext,
  ): Promise<AiGradeResult> {
    void ctx;
    return {
      score: input.scorePercent,
      feedbackFa: input.validationPassed
        ? "اعتبارسنجی قطعی داخل sandbox موفق بود."
        : "برخی از بررسی‌های وضعیت سیستم هنوز پاس نشده‌اند.",
      mistakes: input.validationPassed ? [] : input.details,
      correctExplanationFa: "نمره عملی بر اساس وضعیت واقعی کانتینر محاسبه شده است.",
      recommendedTopics: [],
    };
  }

  async analyzeWeaknesses(
    performances: { topic: string; score: number }[],
    ctx?: TrackAiContext,
  ): Promise<WeaknessAnalysis> {
    void ctx;
    const weakTopics = performances.filter((item) => item.score < 0.6).map((item) => item.topic);
    const strongTopics = performances.filter((item) => item.score >= 0.85).map((item) => item.topic);
    return {
      weakTopics,
      strongTopics,
      summaryFa: weakTopics.length
        ? "چند موضوع نیاز به مرور دارند."
        : "نقطه ضعف جدی ثبت نشده است.",
      recommendedActionsFa: weakTopics.map((topic) => `تمرین جدید برای ${topic} انجام دهید.`),
    };
  }

  async generateReviewExercise(
    topic: string,
    previousPrompt?: string,
    ctx?: TrackAiContext,
  ): Promise<GeneratedExercise> {
    return this.generateExercise(topic, previousPrompt ? `variation of ${previousPrompt}` : undefined, ctx);
  }

  async generatePersonalizedPlan(
    input: {
      currentDay: number;
      weakTopics: string[];
      strongTopics: string[];
    },
    ctx?: TrackAiContext,
  ): Promise<PersonalizedPlan> {
    void ctx;
    return {
      focusTopics: input.weakTopics,
      nextDaySuggestionFa: `پس از تثبیت موضوعات ضعیف، به روز ${input.currentDay + 1} بروید.`,
      reviewPlanFa: input.weakTopics.length
        ? `مرور متمرکز: ${input.weakTopics.join("، ")}`
        : "مرور سبک درس امروز کافی است.",
    };
  }
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
