import { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword } from "../../src/server/auth/password";
import { phases, levels } from "./tracks/devops/curriculum";
import { days as day1 } from "./tracks/devops/day1";
import { extraDays } from "./tracks/devops/days-rest";
import { gitDockerDays } from "./tracks/devops/days-git-docker";
import { cicdDays } from "./tracks/devops/days-cicd";
import { k8sDays } from "./tracks/devops/days-k8s";
import { iacDays } from "./tracks/devops/days-iac";
import { obsDays } from "./tracks/devops/days-obs";
import { sreDays } from "./tracks/devops/days-sre";
import { platformDays } from "./tracks/devops/days-platform";
import { backendPhases } from "./tracks/backend/curriculum";
import { goFundamentalsDays } from "./tracks/backend/module-01-go-fundamentals";
import { goConcurrencyDays } from "./tracks/backend/module-02-concurrency";
import { dsaDays } from "./tracks/backend/module-03-dsa";
import { problemSolvingDays } from "./tracks/backend/module-04-problem-solving";
import { databaseDays } from "./tracks/backend/module-05-database";
import { systemDesignDays } from "./tracks/backend/module-06-system-design";
import { backendGoDays } from "./tracks/backend/module-07-backend-go";
import { interviewDays } from "./tracks/backend/module-08-interviews";
import type { DaySeed } from "./types";
import { TRACK_META, TRACK_SLUGS } from "../../src/config/tracks";

const prisma = new PrismaClient();

function withLinuxPhase<T extends Omit<DaySeed, "phaseSlug">>(day: T): DaySeed {
  return { ...day, phaseSlug: "linux-networking" };
}

async function upsertTrack(slug: string) {
  const meta = TRACK_META[slug as keyof typeof TRACK_META];
  return prisma.track.upsert({
    where: { slug },
    update: {
      titleFa: meta.titleFa,
      titleEn: meta.titleEn,
      descriptionFa: meta.descriptionFa,
      order: meta.order,
      status: "APPROVED",
    },
    create: {
      id: slug === TRACK_SLUGS.DEVOPS_SRE ? "track_devops_sre" : slug === TRACK_SLUGS.BACKEND_GO ? "track_backend_go" : undefined,
      slug,
      titleFa: meta.titleFa,
      titleEn: meta.titleEn,
      descriptionFa: meta.descriptionFa,
      order: meta.order,
      status: "APPROVED",
    },
  });
}

type PhaseSeed = {
  slug: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  order: number;
  weekStart: number;
  weekEnd: number;
  topics: readonly (readonly [string, string, string] | [string, string, string])[];
};

async function seedPhasesAndTopics(
  trackId: string,
  phaseDefs: readonly PhaseSeed[],
  topicBySlug: Map<string, string>,
  phaseBySlug: Map<string, string>,
) {
  for (const phase of phaseDefs) {
    const existing = await prisma.phase.findUnique({
      where: { trackId_slug: { trackId, slug: phase.slug } },
    });
    const row = existing
      ? await prisma.phase.update({
          where: { id: existing.id },
          data: {
            titleFa: phase.titleFa,
            titleEn: phase.titleEn,
            descriptionFa: phase.descriptionFa,
            order: phase.order,
            weekStart: phase.weekStart,
            weekEnd: phase.weekEnd,
          },
        })
      : await prisma.phase.create({
          data: {
            trackId,
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
      const existingTopic = await prisma.topic.findUnique({
        where: { trackId_slug: { trackId, slug } },
      });
      const topicRow = existingTopic
        ? await prisma.topic.update({
            where: { id: existingTopic.id },
            data: {
              titleFa,
              titleEn,
              descriptionFa: `موضوع ${titleFa} در فاز ${phase.titleFa}`,
              order: index + 1,
              phaseId: row.id,
            },
          })
        : await prisma.topic.create({
            data: {
              trackId,
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
}

async function seedDays(
  trackId: string,
  allDays: DaySeed[],
  phaseBySlug: Map<string, string>,
  topicBySlug: Map<string, string>,
  fallbackPhaseId: string,
) {
  for (const day of allDays) {
    const phaseId = phaseBySlug.get(day.phaseSlug) ?? fallbackPhaseId;
    const existing = await prisma.dailyLesson.findUnique({
      where: { trackId_dayNumber: { trackId, dayNumber: day.dayNumber } },
    });
    const daily = existing
      ? await prisma.dailyLesson.update({
          where: { id: existing.id },
          data: {
            titleFa: day.titleFa,
            objectiveFa: day.objectiveFa,
            phaseId,
            status: "APPROVED",
          },
        })
      : await prisma.dailyLesson.create({
          data: {
            trackId,
            dayNumber: day.dayNumber,
            titleFa: day.titleFa,
            objectiveFa: day.objectiveFa,
            phaseId,
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
          lessonSlug: exercise.lessonSlug,
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
}

async function main() {
  const adminPassword = await hashPassword(process.env.AUTH_PASSWORD_ADMIN ?? "admin123");
  const learnerPassword = await hashPassword(process.env.AUTH_PASSWORD_LEARNER ?? "learner123");

  await prisma.settings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" },
  });

  const devopsTrack = await upsertTrack(TRACK_SLUGS.DEVOPS_SRE);
  const backendTrack = await upsertTrack(TRACK_SLUGS.BACKEND_GO);

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
  await seedPhasesAndTopics(devopsTrack.id, phases as readonly PhaseSeed[], topicBySlug, phaseBySlug);

  const backendTopicBySlug = new Map<string, string>();
  const backendPhaseBySlug = new Map<string, string>();
  await seedPhasesAndTopics(backendTrack.id, backendPhases as readonly PhaseSeed[], backendTopicBySlug, backendPhaseBySlug);

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
          activeTrackId: devopsTrack.id,
        },
      },
    },
  });
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {
      displayName: "مدیر",
      currentLevelId: levelRecords[0]?.id,
      activeTrackId: devopsTrack.id,
    },
    create: {
      userId: admin.id,
      displayName: "مدیر",
      currentLevelId: levelRecords[0]?.id,
      activeTrackId: devopsTrack.id,
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
    update: {
      currentLevelId: levelRecords[0]?.id,
      currentDayNumber: 1,
      activeTrackId: devopsTrack.id,
    },
    create: {
      userId: learner.id,
      displayName: "یادگیر",
      currentLevelId: levelRecords[0]?.id,
      currentDayNumber: 1,
      activeTrackId: devopsTrack.id,
    },
  });

  for (const user of [admin, learner]) {
    for (const track of [devopsTrack, backendTrack]) {
      await prisma.userTrackProgress.upsert({
        where: { userId_trackId: { userId: user.id, trackId: track.id } },
        update: {},
        create: { userId: user.id, trackId: track.id, currentDayNumber: 1 },
      });
    }
  }

  const linuxPhaseId = phaseBySlug.get("linux-networking");
  if (!linuxPhaseId) {
    throw new Error("linux phase missing");
  }

  const devopsDays: DaySeed[] = [
    ...day1.map(withLinuxPhase),
    ...extraDays.map(withLinuxPhase),
    ...gitDockerDays,
    ...cicdDays,
    ...k8sDays,
    ...iacDays,
    ...obsDays,
    ...sreDays,
    ...platformDays,
  ];

  await seedDays(devopsTrack.id, devopsDays, phaseBySlug, topicBySlug, linuxPhaseId);

  const goPhaseId = backendPhaseBySlug.get("go-fundamentals");
  if (!goPhaseId) {
    throw new Error("go fundamentals phase missing");
  }
  const backendDays: DaySeed[] = [
    ...goFundamentalsDays,
    ...goConcurrencyDays,
    ...dsaDays,
    ...problemSolvingDays,
    ...databaseDays,
    ...systemDesignDays,
    ...backendGoDays,
    ...interviewDays,
  ];
  await seedDays(backendTrack.id, backendDays, backendPhaseBySlug, backendTopicBySlug, goPhaseId);

  const projects = [
    {
      slug: "linux-prod-server",
      titleFa: "سرور تولید لینوکس",
      descriptionMd: "کاربر عملیاتی، مجوزها، لاگ و سلامت منابع را روی یک سرور لینوکس پیاده کنید.",
      order: 1,
      minLevelOrder: 1,
      tasks: ["کاربر deploy با شل bash", "دایرکتوری /opt/app با مجوز مناسب", "فایل سلامت در /tmp/health.txt"],
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
      injectedFailures: ["CrashLoopBackOff on api", "broken ingress path", "disk fill on loki", "failed health check"],
      tasks: ["پایپ‌لاین سبز", "استقرار کامل مشاهده‌پذیری", "رفع شکست‌های تزریق‌شده", "تمرین DR"],
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
        trackId: devopsTrack.id,
        injectedFailures: "injectedFailures" in project ? project.injectedFailures : undefined,
      },
      create: {
        slug: project.slug,
        titleFa: project.titleFa,
        descriptionMd: project.descriptionMd,
        order: project.order,
        isFinal: Boolean(project.isFinal),
        minLevelOrder: project.minLevelOrder,
        trackId: devopsTrack.id,
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

  console.log("Seed completed", {
    devopsDays: devopsDays.length,
    backendDays: backendDays.length,
    devopsTopics: topicBySlug.size,
    backendTopics: backendTopicBySlug.size,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
