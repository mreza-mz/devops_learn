import { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword } from "../../src/server/auth/password";
import { phases, levels } from "./curriculum";
import { days as day1 } from "./day1";
import { extraDays } from "./days-rest";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hashPassword(process.env.AUTH_PASSWORD_ADMIN ?? "admin123");
  const learnerPassword = await hashPassword(process.env.AUTH_PASSWORD_LEARNER ?? "learner123");

  await prisma.settings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" },
  });

  const levelRecords = [];
  for (const level of levels) {
    const row = await prisma.level.upsert({
      where: { slug: level.slug },
      update: {
        titleFa: level.titleFa,
        titleEn: level.titleEn,
        order: level.order,
        minXp: level.minXp,
        requirements: level.requirements,
      },
      create: {
        slug: level.slug,
        titleFa: level.titleFa,
        titleEn: level.titleEn,
        order: level.order,
        minXp: level.minXp,
        requirements: level.requirements,
      },
    });
    levelRecords.push(row);
  }

  const topicBySlug = new Map<string, string>();
  const phaseBySlug = new Map<string, string>();

  for (const phase of phases) {
    const row = await prisma.phase.upsert({
      where: { slug: phase.slug },
      update: {
        titleFa: phase.titleFa,
        titleEn: phase.titleEn,
        descriptionFa: phase.descriptionFa,
        order: phase.order,
        weekStart: phase.weekStart,
        weekEnd: phase.weekEnd,
      },
      create: {
        slug: phase.slug,
        titleFa: phase.titleFa,
        titleEn: phase.titleEn,
        descriptionFa: phase.descriptionFa,
        order: phase.order,
        weekStart: phase.weekStart,
        weekEnd: phase.weekEnd,
      },
    });
    phaseBySlug.set(phase.slug, row.id);
    for (const [index, topic] of phase.topics.entries()) {
      const [slug, titleFa, titleEn] = topic;
      const topicRow = await prisma.topic.upsert({
        where: { slug },
        update: {
          titleFa,
          titleEn,
          descriptionFa: `موضوع ${titleFa} در فاز ${phase.titleFa}`,
          order: index + 1,
          phaseId: row.id,
        },
        create: {
          slug,
          titleFa,
          titleEn,
          descriptionFa: `موضوع ${titleFa} در فاز ${phase.titleFa}`,
          order: index + 1,
          phaseId: row.id,
        },
      });
      topicBySlug.set(slug, topicRow.id);
      await prisma.skill.upsert({
        where: { slug: `${slug}-core` },
        update: { titleFa, topicId: topicRow.id },
        create: { slug: `${slug}-core`, titleFa, topicId: topicRow.id },
      });
    }
  }

  const admin = await prisma.user.upsert({
    where: { username: process.env.AUTH_USERNAME_ADMIN ?? "admin" },
    update: { passwordHash: adminPassword, role: "ADMIN" },
    create: {
      username: process.env.AUTH_USERNAME_ADMIN ?? "admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      profile: {
        create: {
          displayName: "مدیر",
          currentLevelId: levelRecords[0]?.id,
          currentDayNumber: 1,
        },
      },
    },
  });
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: { displayName: "مدیر", currentLevelId: levelRecords[0]?.id },
    create: {
      userId: admin.id,
      displayName: "مدیر",
      currentLevelId: levelRecords[0]?.id,
    },
  });

  const learner = await prisma.user.upsert({
    where: { username: process.env.AUTH_USERNAME_LEARNER ?? "learner" },
    update: { passwordHash: learnerPassword, role: "LEARNER" },
    create: {
      username: process.env.AUTH_USERNAME_LEARNER ?? "learner",
      passwordHash: learnerPassword,
      role: "LEARNER",
    },
  });
  await prisma.profile.upsert({
    where: { userId: learner.id },
    update: { currentLevelId: levelRecords[0]?.id, currentDayNumber: 1 },
    create: {
      userId: learner.id,
      displayName: "یادگیر",
      currentLevelId: levelRecords[0]?.id,
      currentDayNumber: 1,
    },
  });

  const linuxPhaseId = phaseBySlug.get("linux-networking");
  if (!linuxPhaseId) {
    throw new Error("linux phase missing");
  }

  const allDays = [...day1, ...extraDays];
  for (const day of allDays) {
    const daily = await prisma.dailyLesson.upsert({
      where: { dayNumber: day.dayNumber },
      update: {
        titleFa: day.titleFa,
        objectiveFa: day.objectiveFa,
        phaseId: linuxPhaseId,
        status: "APPROVED",
      },
      create: {
        dayNumber: day.dayNumber,
        titleFa: day.titleFa,
        objectiveFa: day.objectiveFa,
        phaseId: linuxPhaseId,
        status: "APPROVED",
      },
    });

    await prisma.lesson.deleteMany({ where: { dailyLessonId: daily.id } });
    for (const [index, lesson] of day.lessons.entries()) {
      const topicId = topicBySlug.get(lesson.topicSlug);
      if (!topicId) continue;
      await prisma.lesson.create({
        data: {
          topicId,
          dailyLessonId: daily.id,
          slug: lesson.slug,
          titleFa: lesson.titleFa,
          objectiveFa: lesson.objectiveFa,
          theoryMd: lesson.theoryMd,
          practicalMd: lesson.practicalMd,
          exampleMd: lesson.exampleMd,
          commandsJson: lesson.commands,
          order: index + 1,
          status: "APPROVED",
        },
      });
    }

    await prisma.exercise.deleteMany({ where: { dailyLessonId: daily.id } });
    for (const exercise of day.exercises) {
      await prisma.exercise.create({
        data: {
          dailyLessonId: daily.id,
          topicId: topicBySlug.get(exercise.topicSlug),
          titleFa: exercise.titleFa,
          instructionsMd: exercise.instructionsMd,
          difficulty: exercise.difficulty,
          maxScore: exercise.maxScore,
          labSetupJson: (exercise.labSetup ?? undefined) as Prisma.InputJsonValue | undefined,
          validationJson: exercise.validation as Prisma.InputJsonValue,
          hintsJson: exercise.hints as Prisma.InputJsonValue,
          status: "APPROVED",
        },
      });
    }

    await prisma.productionScenario.deleteMany({ where: { dailyLessonId: daily.id } });
    await prisma.productionScenario.create({
      data: {
        dailyLessonId: daily.id,
        titleFa: day.scenario.titleFa,
        incidentMd: day.scenario.incidentMd,
        symptomsMd: day.scenario.symptomsMd,
        observabilityMd: day.scenario.observabilityMd,
        environmentMd: day.scenario.environmentMd,
        hiddenRootCause: day.scenario.hiddenRootCause,
        investigationPath: day.scenario.investigationPath as Prisma.InputJsonValue,
        validationJson: day.scenario.validation as Prisma.InputJsonValue,
        labSetupJson: day.scenario.labSetup as Prisma.InputJsonValue,
        difficulty: day.scenario.difficulty,
        status: "APPROVED",
      },
    });

    await prisma.exam.deleteMany({ where: { dailyLessonId: daily.id } });
    const exam = await prisma.exam.create({
      data: {
        dailyLessonId: daily.id,
        titleFa: day.exam.titleFa,
        questionCount: day.exam.questions.length,
        difficulty: "medium",
        status: "APPROVED",
      },
    });
    for (const [index, question] of day.exam.questions.entries()) {
      await prisma.examQuestion.create({
        data: {
          examId: exam.id,
          topicId: topicBySlug.get(question.topicSlug),
          type: question.type,
          promptFa: question.promptFa,
          optionsJson: question.options ?? undefined,
          correctAnswer: question.correctAnswer,
          explanationFa: question.explanationFa,
          points: question.points,
          difficulty: "medium",
          order: index + 1,
          status: "APPROVED",
        },
      });
    }
  }

  const projects = [
    {
      slug: "linux-prod-server",
      titleFa: "سرور تولید لینوکس",
      descriptionMd: "کاربر عملیاتی، مجوزها، لاگ و سلامت منابع را روی یک سرور لینوکس پیاده کنید.",
      order: 1,
      minLevelOrder: 1,
      tasks: [
        "کاربر deploy با شل bash",
        "دایرکتوری /opt/app با مجوز مناسب",
        "فایل سلامت در /tmp/health.txt",
      ],
    },
    {
      slug: "dockerized-app",
      titleFa: "برنامه داکرایزشده",
      descriptionMd: "Dockerfile، شبکه و والیوم را برای یک سرویس وب طراحی کنید.",
      order: 2,
      minLevelOrder: 3,
      tasks: ["نوشتن Dockerfile", "اجرای کانتینر", "محدودیت CPU/حافظه"],
    },
    {
      slug: "cicd-pipeline",
      titleFa: "پایپ‌لاین CI/CD",
      descriptionMd: "پایپ‌لاین GitLab با تست، بیلد ایمیج و استقرار قابل rollback.",
      order: 3,
      minLevelOrder: 4,
      tasks: ["تعریف stages", "مدیریت secrets", "استراتژی rollback"],
    },
    {
      slug: "k8s-deploy",
      titleFa: "استقرار کوبرنتیز",
      descriptionMd: "Deployment، Service، Probe و منبع را برای اپلیکیشن تعریف کنید.",
      order: 4,
      minLevelOrder: 5,
      tasks: ["مانیفست Deployment", "Service و Ingress", "Probe و منابع"],
    },
    {
      slug: "monitoring-stack",
      titleFa: "پشته پایش",
      descriptionMd: "Prometheus، Grafana، Loki و Alertmanager را به هم وصل کنید.",
      order: 5,
      minLevelOrder: 6,
      tasks: ["متریک طلایی", "داشبورد", "هشدار SLO"],
    },
    {
      slug: "ha-database",
      titleFa: "دیتابیس با دسترس‌پذیری بالا",
      descriptionMd: "PostgreSQL با replicaiton، پشتیبان و بازیابی.",
      order: 6,
      minLevelOrder: 6,
      tasks: ["replication", "backup", "failover تمرینی"],
    },
    {
      slug: "final-platform",
      titleFa: "پلتفرم شبیه تولید",
      descriptionMd:
        "GitLab CI/CD، Docker، Registry، Kubernetes، اپ، PostgreSQL، Redis، Prometheus، Grafana، Loki، Alertmanager، پشتیبان، هشدار و بازیابی از فاجعه. شکست‌های عمدی تزریق شده‌اند.",
      order: 7,
      isFinal: true,
      minLevelOrder: 7,
      injectedFailures: [
        "CrashLoopBackOff on api",
        "broken ingress path",
        "disk fill on loki",
        "failed health check",
      ],
      tasks: [
        "پایپ‌لاین سبز",
        "استقرار کامل مشاهده‌پذیری",
        "رفع شکست‌های تزریق‌شده",
        "تمرین DR",
      ],
    },
  ];

  for (const project of projects) {
    const row = await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        titleFa: project.titleFa,
        descriptionMd: project.descriptionMd,
        order: project.order,
        isFinal: Boolean(project.isFinal),
        minLevelOrder: project.minLevelOrder,
        injectedFailures: "injectedFailures" in project ? project.injectedFailures : undefined,
      },
      create: {
        slug: project.slug,
        titleFa: project.titleFa,
        descriptionMd: project.descriptionMd,
        order: project.order,
        isFinal: Boolean(project.isFinal),
        minLevelOrder: project.minLevelOrder,
        injectedFailures: "injectedFailures" in project ? project.injectedFailures : undefined,
      },
    });
    await prisma.projectTask.deleteMany({ where: { projectId: row.id } });
    for (const [index, titleFa] of project.tasks.entries()) {
      await prisma.projectTask.create({
        data: {
          projectId: row.id,
          titleFa,
          instructionsMd: `${titleFa}. شواهد را در محیط لب یا یادداشت عملی ثبت کنید.`,
          order: index + 1,
          validationJson: { checks: [{ type: "commandExitCode", command: "true", expected: 0 }] },
        },
      });
    }
  }

  const achievements = [
    ["streak-3", "۳ روز پیاپی", "سه روز مطالعه پشت‌سرهم", 40],
    ["streak-7", "هفته کامل", "هفت روز streak", 80],
    ["first-pass", "اولین قبولی", "اولین روز قبول‌شده", 50],
    ["week-complete", "هفته اول", "هفت روز قبول‌شده", 120],
  ] as const;
  for (const [slug, titleFa, descriptionFa, xpReward] of achievements) {
    await prisma.achievement.upsert({
      where: { slug },
      update: { titleFa, descriptionFa, xpReward },
      create: { slug, titleFa, descriptionFa, xpReward },
    });
  }

  console.log("Seed completed", { topics: topicBySlug.size, days: allDays.length });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
