import { describe, expect, it } from "vitest";
import { checkToCommand, summarizeValidation, validationSpecSchema } from "@/services/validation/validation-engine";
import { generatedExerciseSchema, generatedLessonSchema, loginSchema } from "@/validators/ai";

describe("validation engine", () => {
  it("parses expected state specs", () => {
    const spec = validationSpecSchema.parse({
      checks: [
        { type: "userExists", name: "deploy" },
        { type: "serviceRunning", name: "nginx" },
        { type: "portOpen", port: 80 },
      ],
    });
    expect(spec.checks).toHaveLength(3);
  });

  it("maps checks to sandbox commands", () => {
    const mapped = checkToCommand({ type: "fileExists", path: "/tmp/ps.txt" });
    expect(mapped.command).toContain("/tmp/ps.txt");
    expect(mapped.interpret(0, "")).toBe(true);
  });

  it("summarizes pass rate", () => {
    expect(
      summarizeValidation([
        { type: "a", passed: true, detail: "ok" },
        { type: "b", passed: false, detail: "no" },
      ]),
    ).toEqual({ passed: false, scorePercent: 50 });
  });
});

describe("AI validators", () => {
  it("rejects short generated lessons", () => {
    expect(() =>
      generatedLessonSchema.parse({
        titleFa: "x",
        objectiveFa: "y",
        theoryMd: "short",
        practicalMd: "short",
        exampleMd: "short",
        commands: [],
      }),
    ).toThrow();
  });

  it("accepts a valid generated exercise envelope", () => {
    const parsed = generatedExerciseSchema.parse({
      titleFa: "تمرین مرور",
      instructionsMd: "یک فایل در tmp بسازید و محتوا بنویسید.",
      difficulty: "easy",
      hints: [{ level: 1, textFa: "از echo استفاده کنید" }],
      validation: { checks: [{ type: "fileExists", path: "/tmp/a.txt" }] },
    });
    expect(parsed.difficulty).toBe("easy");
  });

  it("validates login payload", () => {
    expect(loginSchema.parse({ username: "learner", password: "secret1" }).username).toBe("learner");
  });
});
