import { prisma } from "@/server/db/prisma";

export const userRepository = {
  findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: { profile: true } });
  },
};

export const curriculumRepository = {
  getDay(dayNumber: number) {
    return prisma.dailyLesson.findUnique({
      where: { dayNumber },
      include: { phase: true, lessons: true, exercises: true, scenario: true, exam: true },
    });
  },
  listTopics() {
    return prisma.topic.findMany({ include: { phase: true }, orderBy: { order: "asc" } });
  },
};

export const settingsRepository = {
  get() {
    return prisma.settings.findUniqueOrThrow({ where: { id: "global" } });
  },
};
