import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export let prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** After replacing the SQLite file, disconnect and open a fresh client. */
export async function resetPrismaConnection() {
  await prisma.$disconnect().catch(() => undefined);
  prisma = createPrismaClient();
  globalForPrisma.prisma = prisma;
  return prisma;
}
