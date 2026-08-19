import { z } from "zod";
import type { ValidationCheck, ValidationSpec } from "@/types/domain";

export const validationCheckSchema: z.ZodType<ValidationCheck> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("userExists"),
    name: z.string().min(1),
    shell: z.string().optional(),
    group: z.string().optional(),
  }),
  z.object({ type: z.literal("fileExists"), path: z.string().min(1) }),
  z.object({ type: z.literal("directoryExists"), path: z.string().min(1) }),
  z.object({ type: z.literal("fileContains"), path: z.string().min(1), text: z.string().min(1) }),
  z.object({ type: z.literal("processNotRunning"), name: z.string().min(1) }),
  z.object({ type: z.literal("processRunning"), name: z.string().min(1) }),
  z.object({ type: z.literal("serviceRunning"), name: z.string().min(1) }),
  z.object({ type: z.literal("portOpen"), port: z.number().int().positive() }),
  z.object({ type: z.literal("packageInstalled"), name: z.string().min(1) }),
  z.object({
    type: z.literal("commandExitCode"),
    command: z.string().min(1),
    expected: z.number().int(),
  }),
  z.object({
    type: z.literal("commandOutputContains"),
    command: z.string().min(1),
    text: z.string().min(1),
  }),
  z.object({ type: z.literal("dockerContainerRunning"), name: z.string().min(1) }),
  z.object({
    type: z.literal("k8sResourceExists"),
    kind: z.string().min(1),
    name: z.string().min(1),
    namespace: z.string().optional(),
  }),
]);

export const validationSpecSchema = z.object({
  checks: z.array(validationCheckSchema).min(1),
}) satisfies z.ZodType<ValidationSpec>;

export type CheckResult = {
  type: string;
  passed: boolean;
  detail: string;
};

export function summarizeValidation(results: CheckResult[]): { passed: boolean; scorePercent: number } {
  if (results.length === 0) {
    return { passed: false, scorePercent: 0 };
  }
  const passedCount = results.filter((item) => item.passed).length;
  return {
    passed: passedCount === results.length,
    scorePercent: (passedCount / results.length) * 100,
  };
}

export function describeFailedCheck(check: ValidationCheck): string {
  switch (check.type) {
    case "fileExists":
      return check.path.startsWith("/tmp/")
        ? `فایل \`${check.path}\` وجود ندارد. مسیر باید با / شروع شود (\`/tmp/...\` نه \`tmp/...\`).`
        : `فایل \`${check.path}\` وجود ندارد. خروجی فرمان را با > در همین مسیر ذخیره کنید.`;
    case "directoryExists":
      return `پوشه \`${check.path}\` وجود ندارد. با mkdir -p بسازید.`;
    case "fileContains":
      return check.path.startsWith("/tmp/")
        ? `داخل \`${check.path}\` متن «${check.text}» پیدا نشد. با cat \`${check.path}\` چک کنید؛ فایل \`tmp/...\` در پوشهٔ فعلی حساب نمی‌شود.`
        : `داخل \`${check.path}\` متن «${check.text}» پیدا نشد. فایل را با cat بررسی کنید.`;
    case "userExists":
      return `کاربر \`${check.name}\`${check.shell ? ` با شل ${check.shell}` : ""} پیدا نشد.`;
    case "processNotRunning":
      return `فرآیند \`${check.name}\` هنوز در حال اجرا است.`;
    case "processRunning":
      return `فرآیند \`${check.name}\` در حال اجرا نیست.`;
    case "serviceRunning":
      return `سرویس \`${check.name}\` فعال نیست.`;
    case "portOpen":
      return `پورت ${check.port} در حالت listen نیست.`;
    case "packageInstalled":
      return `بستهٔ \`${check.name}\` نصب نشده است.`;
    case "commandExitCode":
      return `فرمان اعتبارسنجی کد خروج ${check.expected} نداد.`;
    case "commandOutputContains":
      return `خروجی فرمان متن «${check.text}» را نداشت.`;
    case "dockerContainerRunning":
      return `کانتینر \`${check.name}\` در حال اجرا نیست.`;
    case "k8sResourceExists":
      return `منبع ${check.kind}/${check.name} پیدا نشد.`;
    default: {
      const neverCheck: never = check;
      return `بررسی ناموفق بود: ${JSON.stringify(neverCheck)}`;
    }
  }
}

export function learnerValidationFeedback(results: CheckResult[], passed: boolean): string {
  if (passed) {
    return "اعتبارسنجی موفق بود. وضعیت داخل کانتینر با تمرین یکی است.";
  }
  const failed = results.filter((item) => !item.passed).map((item) => item.detail);
  if (failed.length === 0) {
    return "اعتبارسنجی ناموفق بود.";
  }
  return ["این موارد هنوز پاس نشده‌اند:", ...failed.map((detail) => `• ${detail}`)].join("\n");
}

export function checkToCommand(check: ValidationCheck): { command: string; interpret: (code: number, stdout: string) => boolean } {
  switch (check.type) {
    case "userExists": {
      const extra = [
        check.shell ? `[ "$(getent passwd ${check.name} | cut -d: -f7)" = "${check.shell}" ]` : "",
        check.group ? `id -nG ${check.name} | grep -qw ${check.group}` : "",
      ]
        .filter(Boolean)
        .join(" && ");
      return {
        command: `id ${check.name} >/dev/null 2>&1${extra ? ` && ${extra}` : ""}`,
        interpret: (code) => code === 0,
      };
    }
    case "fileExists":
      return { command: `test -f ${shellQuote(check.path)}`, interpret: (code) => code === 0 };
    case "directoryExists":
      return { command: `test -d ${shellQuote(check.path)}`, interpret: (code) => code === 0 };
    case "fileContains":
      return {
        command: `grep -F -- ${shellQuote(check.text)} ${shellQuote(check.path)}`,
        interpret: (code) => code === 0,
      };
    case "processNotRunning":
      return {
        command: `pgrep -f ${shellQuote(check.name)} >/dev/null`,
        interpret: (code) => code !== 0,
      };
    case "processRunning":
      return {
        command: `pgrep -f ${shellQuote(check.name)} >/dev/null`,
        interpret: (code) => code === 0,
      };
    case "serviceRunning":
      return {
        command: `(systemctl is-active ${shellQuote(check.name)} || service ${shellQuote(check.name)} status) >/dev/null 2>&1`,
        interpret: (code) => code === 0,
      };
    case "portOpen":
      return {
        command: `(ss -lnt | grep -q ':${check.port} ' ) || (netstat -lnt 2>/dev/null | grep -q ':${check.port} ')`,
        interpret: (code) => code === 0,
      };
    case "packageInstalled":
      return {
        command: `dpkg -s ${shellQuote(check.name)} >/dev/null 2>&1 || rpm -q ${shellQuote(check.name)} >/dev/null 2>&1`,
        interpret: (code) => code === 0,
      };
    case "commandExitCode":
      return {
        command: check.command,
        interpret: (code) => code === check.expected,
      };
    case "commandOutputContains":
      return {
        command: check.command,
        interpret: (_code, stdout) => stdout.includes(check.text),
      };
    case "dockerContainerRunning":
      return {
        command: `docker inspect -f '{{.State.Running}}' ${shellQuote(check.name)} 2>/dev/null | grep -q true`,
        interpret: (code) => code === 0,
      };
    case "k8sResourceExists":
      return {
        command: `kubectl get ${shellQuote(check.kind)} ${shellQuote(check.name)} ${check.namespace ? `-n ${shellQuote(check.namespace)}` : ""}`,
        interpret: (code) => code === 0,
      };
    default: {
      const neverCheck: never = check;
      throw new Error(`Unsupported validation check: ${JSON.stringify(neverCheck)}`);
    }
  }
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}
