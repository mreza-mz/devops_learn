#!/usr/bin/env tsx
/**
 * CLI backup helper — self-contained so it does not need Next.js path aliases.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const SQLITE_HEADER = "SQLite format 3";

function resolveSqlitePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const raw = url.replace(/^file:/, "").split("?")[0] ?? "./dev.db";
  if (path.isAbsolute(raw)) return raw;
  return path.resolve(process.cwd(), "prisma", raw);
}

function sqlPathLiteral(filePath: string): string {
  return filePath.replace(/'/g, "''");
}

function assertSqlite(buffer: Buffer) {
  if (buffer.byteLength < 16 || buffer.subarray(0, 15).toString("utf8") !== SQLITE_HEADER) {
    throw new Error("Invalid SQLite backup file.");
  }
}

async function exportDb(outPath: string) {
  const prisma = new PrismaClient();
  const tmp = path.join(path.dirname(outPath), `.tmp-export-${Date.now()}.db`);
  try {
    try {
      await prisma.$executeRawUnsafe("PRAGMA wal_checkpoint(TRUNCATE)");
    } catch {
      /* ignore */
    }
    await fs.unlink(tmp).catch(() => undefined);
    await prisma.$executeRawUnsafe(`VACUUM INTO '${sqlPathLiteral(tmp)}'`);
    const buffer = await fs.readFile(tmp);
    assertSqlite(buffer);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, buffer);
    console.log(`Exported ${buffer.byteLength} bytes → ${outPath}`);
  } finally {
    await fs.unlink(tmp).catch(() => undefined);
    await prisma.$disconnect();
  }
}

async function importDb(inPath: string) {
  const buffer = await fs.readFile(inPath);
  assertSqlite(buffer);
  const dbPath = resolveSqlitePath();
  await fs.mkdir(path.dirname(dbPath), { recursive: true });

  let previous: string | null = null;
  try {
    await fs.access(dbPath);
    previous = `${dbPath}.pre-import-${Date.now()}.bak`;
    await fs.copyFile(dbPath, previous);
  } catch {
    previous = null;
  }

  await fs.writeFile(dbPath, buffer);
  await fs.unlink(`${dbPath}-wal`).catch(() => undefined);
  await fs.unlink(`${dbPath}-shm`).catch(() => undefined);

  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Imported into ${dbPath}`);
  if (previous) console.log(`Previous DB saved at ${previous}`);
}

async function main() {
  const [command, target] = process.argv.slice(2);
  if (command === "export") {
    const out = path.resolve(target ?? `./devops-learn-backup-${Date.now()}.db`);
    await exportDb(out);
    return;
  }
  if (command === "import") {
    if (!target) throw new Error("Usage: npm run db:import -- <backup.db>");
    await importDb(path.resolve(target));
    return;
  }
  console.log(`Usage:
  npm run db:export -- [out.db]
  npm run db:import -- <backup.db>

Current DB: ${resolveSqlitePath()}`);
  process.exit(command ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
