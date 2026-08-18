import { prisma } from "@/server/db/prisma";
import { errors } from "@/lib/errors";
import { ATTEMPT_STATUS } from "@/config/constants";

export const achievementService = {
  async listForUser(userId: string) {
    return prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    });
  },

  async award(userId: string, slug: string) {
    const achievement = await prisma.achievement.findUnique({ where: { slug } });
    if (!achievement) {
      throw errors.notFound("دستاورد");
    }
    return prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
      update: {},
      create: { userId, achievementId: achievement.id },
    });
  },

  statusFromScore(passed: boolean, excellent: boolean) {
    if (excellent) return ATTEMPT_STATUS.EXCELLENT;
    if (passed) return ATTEMPT_STATUS.PASSED;
    return ATTEMPT_STATUS.FAILED;
  },
};
