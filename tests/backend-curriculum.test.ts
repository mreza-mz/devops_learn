import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { backendPhases } from "../prisma/seed/tracks/backend/curriculum";
import { goFundamentalsDays } from "../prisma/seed/tracks/backend/module-01-go-fundamentals";
import { goConcurrencyDays } from "../prisma/seed/tracks/backend/module-02-concurrency";
import { dsaDays } from "../prisma/seed/tracks/backend/module-03-dsa";
import { problemSolvingDays } from "../prisma/seed/tracks/backend/module-04-problem-solving";
import { databaseDays } from "../prisma/seed/tracks/backend/module-05-database";
import { systemDesignDays } from "../prisma/seed/tracks/backend/module-06-system-design";
import { backendGoDays } from "../prisma/seed/tracks/backend/module-07-backend-go";
import { interviewDays } from "../prisma/seed/tracks/backend/module-08-interviews";
import { INTERVIEW_LESSON_BY_CATEGORY, INTERVIEW_QUESTION_BANK } from "../src/config/interview-bank";

const days = [
  ...goFundamentalsDays,
  ...goConcurrencyDays,
  ...dsaDays,
  ...problemSolvingDays,
  ...databaseDays,
  ...systemDesignDays,
  ...backendGoDays,
  ...interviewDays,
];

const topicSlugs = new Set<string>(backendPhases.flatMap((phase) => phase.topics.map(([slug]) => slug)));
const phaseSlugs = new Set<string>(backendPhases.map((phase) => phase.slug));

describe("backend-go curriculum seed", () => {
  it("numbers days 1..N without gaps", () => {
    expect(days.map((d) => d.dayNumber)).toEqual(days.map((_, i) => i + 1));
  });

  it("uses only known phases and topics", () => {
    for (const d of days) {
      expect(phaseSlugs, `day ${d.dayNumber} phase`).toContain(d.phaseSlug);
      for (const slug of d.topicSlugs) expect(topicSlugs, `day ${d.dayNumber} topic ${slug}`).toContain(slug);
      for (const l of d.lessons) expect(topicSlugs, `lesson ${l.slug}`).toContain(l.topicSlug);
      for (const e of d.exercises) expect(topicSlugs, `exercise ${e.titleFa}`).toContain(e.topicSlug);
      for (const q of d.exam.questions) expect(topicSlugs, `question ${q.promptFa}`).toContain(q.topicSlug);
    }
  });

  it("links every exercise to a lesson of the same day", () => {
    for (const d of days) {
      const lessonSlugs = new Set(d.lessons.map((l) => l.slug));
      for (const e of d.exercises) {
        if (e.lessonSlug) expect(lessonSlugs, `day ${d.dayNumber}: ${e.titleFa}`).toContain(e.lessonSlug);
      }
    }
  });

  it("has unique lesson slugs across the track", () => {
    const slugs = days.flatMap((d) => d.lessons.map((l) => l.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has a valid correct answer for every multiple-choice question", () => {
    for (const d of days) {
      for (const q of d.exam.questions) {
        if (q.type === "MULTIPLE_CHOICE") {
          expect(q.options, `day ${d.dayNumber}: ${q.promptFa}`).toContain(q.correctAnswer);
        }
      }
    }
  });

  it("never hands out a ready-made shell command as the last hint of a written exercise", () => {
    for (const d of days) {
      for (const e of d.exercises) {
        const last = e.hints.at(-1)?.textFa ?? "";
        expect(last, `day ${d.dayNumber}: ${e.titleFa}`).not.toMatch(/^(echo|printf) /);
      }
    }
  });

  it("wires every Go lab to an existing lab directory with tests and a reference solution", () => {
    const labsDir = path.join(__dirname, "../prisma/seed/tracks/backend/labs");
    const used = new Set<string>();
    for (const d of days) {
      for (const e of d.exercises) {
        const setup = e.labSetup?.commands.join("\n") ?? "";
        const match = setup.match(/mkdir -p \/root\/labs\/([a-z0-9-]+)/);
        if (!match) continue;
        const lab = match[1];
        used.add(lab);
        const files = fs.readdirSync(path.join(labsDir, lab));
        expect(files.some((f) => f.endsWith("_test.go")), lab).toBe(true);
        expect(fs.readdirSync(path.join(labsDir, lab, "solution")).length, lab).toBeGreaterThan(0);
        expect(e.validation.checks.length, lab).toBe(3);
      }
    }
    const onDisk = fs.readdirSync(labsDir).filter((name) => fs.statSync(path.join(labsDir, name)).isDirectory());
    expect([...used].sort()).toEqual(onDisk.sort());
  });

  it("points interview categories at existing days", () => {
    for (const { dayNumber } of Object.values(INTERVIEW_LESSON_BY_CATEGORY)) {
      expect(dayNumber).toBeGreaterThanOrEqual(1);
      expect(dayNumber).toBeLessThanOrEqual(days.length);
    }
    const ids = INTERVIEW_QUESTION_BANK.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
