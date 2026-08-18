import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function logger(message: string, error?: unknown) {
  const payload = {
    ts: new Date().toISOString(),
    service: "terminal-gateway",
    message,
    error: error instanceof Error ? error.message : error,
  };
  console.log(JSON.stringify(payload));
}

export function loadGatewayEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return;
  }
  for (const rawLine of readFileSync(envPath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function toBuffer(data: Buffer | ArrayBuffer | Buffer[] | string): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (typeof data === "string") {
    return Buffer.from(data, "utf8");
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }
  if (Array.isArray(data)) {
    return Buffer.concat(data);
  }
  return Buffer.from(String(data), "utf8");
}
