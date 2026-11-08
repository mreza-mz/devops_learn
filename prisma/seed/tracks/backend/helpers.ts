import fs from "node:fs";
import path from "node:path";
import { type DaySeed, mc, noteExercise as baseNoteExercise, noteScenario, sa, tf } from "../../types";

export function goLesson(opts: {
  slug: string;
  topicSlug: string;
  titleFa: string;
  objectiveFa: string;
  theoryMd: string;
  practicalMd: string;
  exampleMd: string;
}) {
  return { ...opts, commands: [] as string[] };
}

export function day(opts: {
  dayNumber: number;
  phaseSlug: string;
  titleFa: string;
  objectiveFa: string;
  topicSlugs: string[];
  lessons: ReturnType<typeof goLesson>[];
  exercises: DaySeed["exercises"];
  scenario: DaySeed["scenario"];
  exam: DaySeed["exam"];
}): DaySeed {
  return opts;
}

/**
 * Written design/analysis exercise. Same validation as the shared helper, but the
 * level-3 hint is an answer outline instead of a ready-made shell command, so the
 * learner still has to think. Use real Go labs (goLab) whenever code can be tested.
 */
export function noteExercise(opts: Parameters<typeof baseNoteExercise>[0] & { answerOutlineFa?: string }) {
  const { answerOutlineFa, ...rest } = opts;
  const base = baseNoteExercise(rest);
  if (opts.hints) return base;
  return {
    ...base,
    hints: [
      base.hints[0],
      {
        level: 2,
        textFa: `ساختار پاسخ: مسئله → علت → راه‌حل → trade-off. عبارت «${opts.mustContain}» باید در پاسخ باشد.`,
      },
      {
        level: 3,
        textFa: answerOutlineFa ?? `جواب خوب سطح Senior: علت را با مکانیزم runtime/سیستم توضیح دهد، راه‌حل را با کد یا شبه‌کد نشان دهد و یک trade-off یا ریسک را نام ببرد.`,
      },
    ],
  };
}

const LABS_DIR = path.join(__dirname, "labs");
const LAB_ROOT = "/root/labs";
const LAB_META = "/root/.golab";
const GO_MOD = "module example.com/lab\n\ngo 1.22\n";

function b64(text: string) {
  return Buffer.from(text, "utf8").toString("base64");
}

/**
 * A real Go coding lab: starter code + tests from prisma/seed/tracks/backend/labs/<lab>
 * are written to ~/labs/<lab> in the sandbox. The exercise passes only when the
 * provided tests are untouched, `go vet` is clean and `go test` passes.
 * Every lab is checked by `npm run labs:verify` (starter fails, solution passes).
 */
export function goLab(opts: {
  lab: string;
  titleFa: string;
  topicSlug: string;
  lessonSlug: string;
  instructionsMd: string;
  hints: [string, string, string];
  race?: boolean;
  difficulty?: "easy" | "medium" | "hard";
  maxScore?: number;
}): DaySeed["exercises"][number] {
  const dir = path.join(LABS_DIR, opts.lab);
  const files = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".go"))
    .sort();
  if (!files.some((name) => name.endsWith("_test.go"))) {
    throw new Error(`go lab ${opts.lab} has no _test.go file`);
  }
  const target = `${LAB_ROOT}/${opts.lab}`;
  const testFiles = files.filter((name) => name.endsWith("_test.go"));

  const commands = [
    `mkdir -p ${target} ${LAB_META}`,
    `echo ${b64(GO_MOD)} | base64 -d > ${target}/go.mod`,
    ...files.map((name) => `echo ${b64(fs.readFileSync(path.join(dir, name), "utf8"))} | base64 -d > ${target}/${name}`),
    `cd ${target} && sha256sum ${testFiles.join(" ")} > ${LAB_META}/${opts.lab}.sha256`,
  ];

  const testCmd = `go test -count=1 -timeout 120s${opts.race ? " -race" : ""} ./...`;
  const filesList = files.map((name) => `\`${name}\``).join("، ");

  return {
    titleFa: opts.titleFa,
    topicSlug: opts.topicSlug,
    lessonSlug: opts.lessonSlug,
    instructionsMd: `${opts.instructionsMd}

---
**محیط لب:** پوشهٔ \`~/labs/${opts.lab}\` (فایل‌ها: ${filesList}).

\`\`\`bash
cd ~/labs/${opts.lab}
${testCmd}
\`\`\`

شرط قبولی: تست‌ها دست‌نخورده بمانند، \`go vet ./...\` تمیز باشد و دستور بالا پاس شود. فایل‌های \`_test.go\` را بخوانید؛ مشخصات دقیق همان‌جاست.`,
    difficulty: opts.difficulty ?? "medium",
    maxScore: opts.maxScore ?? 20,
    labSetup: { commands },
    validation: {
      checks: [
        { type: "commandExitCode", command: `cd ${target} && sha256sum --quiet -c ${LAB_META}/${opts.lab}.sha256`, expected: 0 },
        { type: "commandExitCode", command: `cd ${target} && go vet ./...`, expected: 0 },
        { type: "commandExitCode", command: `cd ${target} && ${testCmd}`, expected: 0 },
      ],
    },
    hints: opts.hints.map((textFa, index) => ({ level: index + 1, textFa })),
  };
}

export { mc, noteScenario, sa, tf };
export type { DaySeed };
