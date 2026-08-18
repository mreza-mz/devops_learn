import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16),
  AUTH_USERNAME_ADMIN: z.string().default("admin"),
  AUTH_PASSWORD_ADMIN: z.string().default("admin123"),
  AUTH_USERNAME_LEARNER: z.string().default("learner"),
  AUTH_PASSWORD_LEARNER: z.string().default("learner123"),
  AVALAI_API_KEY: z.string().optional().default(""),
  AVALAI_BASE_URL: z.string().default("https://api.avalai.ir/v1"),
  AVALAI_MODEL: z.string().default("gpt-4o-mini"),
  AVALAI_TIMEOUT_MS: z.coerce.number().default(30000),
  AVALAI_MAX_RETRIES: z.coerce.number().default(2),
  AVALAI_MAX_TOKENS: z.coerce.number().default(2048),
  AVALAI_CHAT_PATH: z.string().default("/chat/completions"),
  LAB_CPU_LIMIT: z.string().default("0.5"),
  LAB_MEMORY_LIMIT: z.string().default("512m"),
  LAB_TIMEOUT_SECONDS: z.coerce.number().default(1800),
  LAB_MAX_PROCESSES: z.coerce.number().default(64),
  LAB_IMAGE: z.string().default("devops-learn-lab:latest"),
  TERMINAL_GATEWAY_PORT: z.coerce.number().default(3001),
  NEXT_PUBLIC_TERMINAL_GATEWAY_URL: z.string().default("ws://127.0.0.1:3001"),
  APP_URL: z.string().default("http://localhost:3000"),
  NODE_ENV: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) {
    return cached;
  }
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}

export function isAiConfigured(): boolean {
  return Boolean(getEnv().AVALAI_API_KEY);
}
