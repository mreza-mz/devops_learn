import { describe, expect, it } from "vitest";
import { detectWeakTopics, isWeakTopic, updateTopicAverage } from "@/services/progress/weakness-engine";
import { canUnlockLevel, nextStreak } from "@/services/progress/level-engine";

describe("weakness engine", () => {
  it("updates running average", () => {
    const next = updateTopicAverage(0.8, 1, 0.4);
    expect(next.sampleCount).toBe(2);
    expect(next.scoreAvg).toBeCloseTo(0.6);
  });

  it("detects weak topics below threshold", () => {
    expect(isWeakTopic(0.43, 0.6)).toBe(true);
    const weak = detectWeakTopics(
      [
        { topicId: "dns", scoreAvg: 0.43, sampleCount: 3 },
        { topicId: "linux", scoreAvg: 0.92, sampleCount: 3 },
      ],
      0.6,
    );
    expect(weak.map((item) => item.topicId)).toEqual(["dns"]);
  });
});

describe("level engine", () => {
  it("does not unlock on lessons-only progress", () => {
    const ok = canUnlockLevel(
      {
        examAverage: 0.4,
        practicalSuccessRate: 0,
        scenariosPassed: 0,
        projectsCompleted: 0,
        streak: 1,
        weakTopicCount: 10,
        currentLevelOrder: 1,
        xp: 5000,
      },
      {
        minExamAverage: 0.7,
        minPracticalSuccessRate: 0.7,
        minScenariosPassed: 2,
        minProjectsCompleted: 1,
        minStreak: 3,
        weakTopicMax: 3,
        previousLevelOrder: 1,
      },
      100,
    );
    expect(ok).toBe(false);
  });

  it("increments streak across consecutive UTC days", () => {
    const last = new Date("2026-08-16T10:00:00Z");
    const now = new Date("2026-08-17T09:00:00Z");
    expect(nextStreak(last, now, 4)).toBe(5);
  });
});
