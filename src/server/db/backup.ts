import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { prisma, resetPrismaConnection } from "@/server/db/prisma";
import { errors } from "@/lib/errors";

const SQLITE_HEADER = "SQLite format 3";
const MAX_IMPORT_BYTES = 100 * 1024 * 1024; // 100 MB

/** Prisma `file:./dev.db` is resolved relative to the `prisma/` folder. */
export function resolveSqlitePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const raw = url.replace(/^file:/, "").split("?")[0] ?? "./dev.db";
  if (path.isAbsolute(raw)) {
    return raw;
  }
  return path.resolve(process.cwd(), "prisma", raw);
}

function assertSqliteBuffer(buffer: Buffer) {
  if (buffer.byteLength < 16) {
    throw errors.validation("فایل دیتابیس خالی یا ناقص است.");
  }
  if (buffer.byteLength > MAX_IMPORT_BYTES) {
    throw errors.validation("حجم فایل بکاپ بیش از حد مجاز است.");
  }
  const header = buffer.subarray(0, 15).toString("utf8");
  if (header !== SQLITE_HEADER) {
    throw errors.validation("فایل باید یک دیتابیس SQLite معتبر باشد (.db).");
  }
}

function sqlPathLiteral(filePath: string): string {
  return filePath.replace(/'/g, "''");
}

export async function exportDatabaseSnapshot(): Promise<{ buffer: Buffer; filename: string }> {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `devops-learn-backup-${stamp}.db`;
  const tmpPath = path.join(os.tmpdir(), filename);

  try {
    await prisma.$executeRawUnsafe("PRAGMA wal_checkpoint(TRUNCATE)");
  } catch {
    // ignore if WAL is not active
  }

  await fs.unlink(tmpPath).catch(() => undefined);
  await prisma.$executeRawUnsafe(`VACUUM INTO '${sqlPathLiteral(tmpPath)}'`);

  try {
    const buffer = await fs.readFile(tmpPath);
    assertSqliteBuffer(buffer);
    return { buffer, filename };
  } finally {
    await fs.unlink(tmpPath).catch(() => undefined);
  }
}

export async function importDatabaseSnapshot(buffer: Buffer): Promise<{ previousBackupPath: string | null }> {
  assertSqliteBuffer(buffer);

  const dbPath = resolveSqlitePath();
  await fs.mkdir(path.dirname(dbPath), { recursive: true });

  let previousBackupPath: string | null = null;
  try {
    await fs.access(dbPath);
    previousBackupPath = `${dbPath}.pre-import-${Date.now()}.bak`;
    await fs.copyFile(dbPath, previousBackupPath);
  } catch {
    previousBackupPath = null;
  }

  await prisma.$disconnect().catch(() => undefined);

  await fs.writeFile(dbPath, buffer);
  await fs.unlink(`${dbPath}-wal`).catch(() => undefined);
  await fs.unlink(`${dbPath}-shm`).catch(() => undefined);

  await resetPrismaConnection();
  // smoke-check the new DB
  await prisma.$queryRaw`SELECT 1`;

  return { previousBackupPath };
}
