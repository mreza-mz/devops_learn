import { prisma } from "@/server/db/prisma";
import { errors } from "@/lib/errors";
import { ATTEMPT_STATUS } from "@/config/constants";

export const projectService = {
  async list(userId: string) {
    return prisma.project.findMany({
      orderBy: { order: "asc" },
      include: {
        tasks: { orderBy: { order: "asc" } },
        attempts: { where: { userId } },
      },
    });
  },

  async get(slug: string) {
    const project = await prisma.project.findUnique({
      where: { slug },
      include: { tasks: { orderBy: { order: "asc" } } },
    });
    if (!project) {
      throw errors.notFound("پروژه");
    }
    return project;
  },

  async completeTask(userId: string, taskId: string) {
    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) {
      throw errors.notFound("وظیفه پروژه");
    }
    return prisma.projectAttempt.create({
      data: {
        userId,
        projectId: task.projectId,
        taskId,
        status: ATTEMPT_STATUS.PASSED,
        score: task.maxScore,
        completedAt: new Date(),
      },
    });
  },
};
