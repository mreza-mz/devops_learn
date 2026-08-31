export type DaySeed = {
  dayNumber: number;
  phaseSlug: string;
  titleFa: string;
  objectiveFa: string;
  topicSlugs: string[];
  lessons: {
    slug: string;
    topicSlug: string;
    titleFa: string;
    objectiveFa: string;
    theoryMd: string;
    practicalMd: string;
    exampleMd: string;
    commands: string[];
  }[];
  exercises: {
    titleFa: string;
    topicSlug: string;
    lessonSlug?: string;
    instructionsMd: string;
    difficulty: string;
    maxScore: number;
    labSetup?: { commands: string[] };
    validation: { checks: unknown[] };
    hints: { level: number; textFa: string }[];
  }[];
  scenario: {
    titleFa: string;
    incidentMd: string;
    symptomsMd: string;
    observabilityMd: string;
    environmentMd: string;
    hiddenRootCause: string;
    investigationPath: string[];
    validation: { checks: unknown[] };
    labSetup: { commands: string[] };
    difficulty: string;
  };
  exam: {
    titleFa: string;
    questions: {
      type: string;
      promptFa: string;
      options?: string[];
      correctAnswer: string;
      explanationFa: string;
      points: number;
      topicSlug: string;
    }[];
  };
};

export function mc(
  promptFa: string,
  options: string[],
  correctAnswer: string,
  explanationFa: string,
  topicSlug: string,
  points = 3,
) {
  return { type: "MULTIPLE_CHOICE", promptFa, options, correctAnswer, explanationFa, points, topicSlug };
}

export function tf(promptFa: string, correct: boolean, explanationFa: string, topicSlug: string, points = 3) {
  return {
    type: "TRUE_FALSE",
    promptFa,
    options: ["درست", "نادرست"],
    correctAnswer: correct ? "درست" : "نادرست",
    explanationFa,
    points,
    topicSlug,
  };
}

export function sa(promptFa: string, correctAnswer: string, explanationFa: string, topicSlug: string, points = 3) {
  return { type: "SHORT_ANSWER", promptFa, correctAnswer, explanationFa, points, topicSlug };
}

/** تمرین یادداشت‌برداری مصاحبه — در لب با نوشتن فایل چک می‌شود */
export function noteExercise(opts: {
  titleFa: string;
  topicSlug: string;
  lessonSlug: string;
  path: string;
  mustContain: string;
  instructionsMd: string;
  difficulty?: string;
  maxScore?: number;
  hints?: { level: number; textFa: string }[];
}) {
  return {
    titleFa: opts.titleFa,
    topicSlug: opts.topicSlug,
    lessonSlug: opts.lessonSlug,
    instructionsMd: opts.instructionsMd,
    difficulty: opts.difficulty ?? "medium",
    maxScore: opts.maxScore ?? 15,
    validation: { checks: [{ type: "fileContains", path: opts.path, text: opts.mustContain }] },
    hints: opts.hints ?? [
      { level: 1, textFa: `خروجی را در ${opts.path} ذخیره کنید.` },
      { level: 2, textFa: `متن باید شامل «${opts.mustContain}» باشد.` },
      { level: 3, textFa: `printf '%s\\n' '${opts.mustContain}' > ${opts.path}` },
    ],
  };
}

export function noteScenario(opts: {
  titleFa: string;
  path: string;
  mustContain: string;
  incidentMd: string;
  symptomsMd: string;
  rootCause: string;
  difficulty?: string;
}) {
  return {
    titleFa: opts.titleFa,
    incidentMd: opts.incidentMd,
    symptomsMd: opts.symptomsMd,
    observabilityMd: "یادداشت تحقیق و تصمیم را در فایل مشخص‌شده ثبت کنید.",
    environmentMd: "آزمایشگاه محلی devops-learn — بدون نیاز به کلاستر واقعی.",
    hiddenRootCause: opts.rootCause,
    investigationPath: ["علائم را بخوانید", "فرضیه بسازید", "نتیجه را در فایل بنویسید"],
    validation: { checks: [{ type: "fileContains", path: opts.path, text: opts.mustContain }] },
    labSetup: { commands: [`rm -f ${opts.path}`] },
    difficulty: opts.difficulty ?? "medium",
  };
}
