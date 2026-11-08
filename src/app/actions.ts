"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/validators/ai";
import { prisma } from "@/server/db/prisma";
import { verifyPassword } from "@/server/auth/password";
import { clearSessionCookie, createSessionToken, setSessionCookie } from "@/server/auth/session";
import { requireAdmin, requireUser } from "@/server/auth/guards";
import { learningService } from "@/services/learning/daily-learning-service";
import { labService } from "@/services/lab/lab-service";
import { dockerSandboxService } from "@/server/docker/docker-sandbox-service";
import { projectService } from "@/services/project/project-service";
import { toUserError } from "@/lib/errors";
import { consumeRateLimit } from "@/lib/rate-limit";
import { settingsUpdateSchema } from "@/validators/ai";
import { CONTENT_STATUS } from "@/config/constants";
import { prisma as db } from "@/server/db/prisma";
import { interviewService } from "@/services/interview/interview-service";
import type { InterviewMode } from "@/config/interview-bank";

export async function loginAction(_prev: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "نام کاربری یا رمز عبور معتبر نیست." };
  }
  if (!consumeRateLimit(`login:${parsed.data.username}`, 8, 60_000)) {
    return { error: "تعداد تلاش‌های ورود زیاد است." };
  }
  const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "نام کاربری یا رمز عبور نادرست است." };
  }
  const token = await createSessionToken({
    id: user.id,
    username: user.username,
    role: user.role as "ADMIN" | "LEARNER",
  });
  await setSessionCookie(token);
  redirect("/tracks");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function completeTheoryAction(trackSlug: string, dayNumber: number) {
  const user = await requireUser();
  const { trackService } = await import("@/services/tracks/track-service");
  const track = await trackService.getBySlug(trackSlug);
  await learningService.completeTheory(user.id, track.id, dayNumber);
}

export async function selectTrackAction(trackSlug: string, formData?: FormData) {
  void formData;
  const user = await requireUser();
  const { trackService } = await import("@/services/tracks/track-service");
  await trackService.setActiveTrack(user.id, trackSlug);
  redirect(`/t/${trackSlug}/dashboard`);
}

export async function startExerciseAction(exerciseId: string) {
  const user = await requireUser();
  try {
    return { ok: true as const, data: await labService.startExerciseLab(user.id, exerciseId) };
  } catch (error) {
    return { ok: false as const, error: toUserError(error).message };
  }
}

export async function startScenarioAction(scenarioId: string) {
  const user = await requireUser();
  try {
    return { ok: true as const, data: await labService.startScenarioLab(user.id, scenarioId) };
  } catch (error) {
    return { ok: false as const, error: toUserError(error).message };
  }
}

export async function validateExerciseAction(labId: string, hintsUsed: number) {
  const user = await requireUser();
  try {
    return { ok: true as const, data: await labService.validateExercise(user.id, labId, hintsUsed) };
  } catch (error) {
    return { ok: false as const, error: toUserError(error).message };
  }
}

export async function validateScenarioAction(labId: string) {
  const user = await requireUser();
  try {
    return { ok: true as const, data: await labService.validateScenario(user.id, labId) };
  } catch (error) {
    return { ok: false as const, error: toUserError(error).message };
  }
}

export async function resetLabAction(labId: string) {
  const user = await requireUser();
  const lab = await db.lab.findUnique({ where: { id: labId } });
  if (!lab || lab.userId !== user.id) {
    return { ok: false as const, error: "آزمایشگاه پیدا نشد." };
  }
  try {
    const next = await dockerSandboxService.resetSandbox(labId);
    return { ok: true as const, data: next };
  } catch (error) {
    return { ok: false as const, error: toUserError(error).message };
  }
}

export async function stopLabAction(labId: string) {
  const user = await requireUser();
  const lab = await db.lab.findUnique({ where: { id: labId } });
  if (!lab || lab.userId !== user.id) {
    return { ok: false as const, error: "آزمایشگاه پیدا نشد." };
  }
  await dockerSandboxService.stopSandbox(labId);
  return { ok: true as const };
}

export async function submitExamAction(examId: string, responses: Record<string, string>, timeSpentSec: number) {
  const user = await requireUser();
  try {
    return { ok: true as const, data: await learningService.submitExam(user.id, examId, responses, timeSpentSec) };
  } catch (error) {
    return { ok: false as const, error: toUserError(error).message };
  }
}

export async function generateReviewAction(topicId: string) {
  const user = await requireUser();
  try {
    return { ok: true as const, data: await learningService.createReviewExercise(user.id, topicId) };
  } catch (error) {
    return { ok: false as const, error: toUserError(error).message };
  }
}

export async function completeProjectTaskAction(taskId: string) {
  const user = await requireUser();
  await projectService.completeTask(user.id, taskId);
}

export async function updateSettingsAction(input: unknown) {
  await requireAdmin();
  const parsed = settingsUpdateSchema.parse(input);
  await db.settings.update({ where: { id: "global" }, data: parsed });
}

export async function setContentStatusAction(kind: string, id: string, status: string) {
  await requireAdmin();
  if (!Object.values(CONTENT_STATUS).includes(status as never)) {
    return { error: "وضعیت نامعتبر است." };
  }
  if (kind === "lesson") await db.lesson.update({ where: { id }, data: { status } });
  if (kind === "exercise") await db.exercise.update({ where: { id }, data: { status } });
  if (kind === "scenario") await db.productionScenario.update({ where: { id }, data: { status } });
  if (kind === "exam") await db.exam.update({ where: { id }, data: { status } });
  if (kind === "question") await db.examQuestion.update({ where: { id }, data: { status } });
}

export async function upsertLessonAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    titleFa: String(formData.get("titleFa") ?? ""),
    objectiveFa: String(formData.get("objectiveFa") ?? ""),
    theoryMd: String(formData.get("theoryMd") ?? ""),
    practicalMd: String(formData.get("practicalMd") ?? ""),
    exampleMd: String(formData.get("exampleMd") ?? ""),
    status: String(formData.get("status") ?? "APPROVED"),
  };
  if (id) {
    await db.lesson.update({ where: { id }, data });
  }
}

export async function upsertTopicAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.topic.update({
    where: { id },
    data: {
      titleFa: String(formData.get("titleFa") ?? ""),
      descriptionFa: String(formData.get("descriptionFa") ?? ""),
      weaknessThreshold: Number(formData.get("weaknessThreshold") ?? 0.6),
    },
  });
}

export async function upsertExerciseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.exercise.update({
    where: { id },
    data: {
      titleFa: String(formData.get("titleFa") ?? ""),
      instructionsMd: String(formData.get("instructionsMd") ?? ""),
      difficulty: String(formData.get("difficulty") ?? "easy"),
      maxScore: Number(formData.get("maxScore") ?? 6),
    },
  });
}

export async function startInterviewAction(trackSlug: string, mode: InterviewMode) {
  const user = await requireUser();
  const session = await interviewService.startSession(user.id, trackSlug, mode);
  redirect(`/t/${trackSlug}/interview/${session.id}`);
}

export async function submitInterviewAnswerAction(sessionId: string, answerText: string) {
  const user = await requireUser();
  try {
    return { ok: true as const, data: await interviewService.submitAnswer(user.id, sessionId, answerText) };
  } catch (error) {
    return { ok: false as const, error: toUserError(error).message };
  }
}

export async function finishInterviewAction(sessionId: string) {
  const user = await requireUser();
  try {
    return { ok: true as const, data: await interviewService.finishSession(user.id, sessionId) };
  } catch (error) {
    return { ok: false as const, error: toUserError(error).message };
  }
}
