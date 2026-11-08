import { type DaySeed, mc, noteExercise, noteScenario, sa, tf } from "../../types";

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

export { mc, noteExercise, noteScenario, sa, tf };
export type { DaySeed };
