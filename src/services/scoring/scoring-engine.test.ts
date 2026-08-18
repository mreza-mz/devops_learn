import { describe, expect, it } from "vitest";
import { applyHintPenalty, classifyScore, computeDailyTotal, scaleToWeight, successRate } from "@/services/scoring/scoring-engine";

describe("scoring engine", () => {
  it("sums capped daily parts to 100", () => {
    expect(computeDailyTotal({ theory: 20, practical: 30, scenario: 20, exam: 30 })).toBe(100);
    expect(computeDailyTotal({ theory: 50, practical: 50, scenario: 50, exam: 50 })).toBe(100);
  });

  it("classifies failed passed excellent", () => {
    const thresholds = { passingScore: 70, excellentScore: 90 };
    expect(classifyScore(40, thresholds)).toBe("failed");
    expect(classifyScore(70, thresholds)).toBe("passed");
    expect(classifyScore(95, thresholds)).toBe("excellent");
  });

  it("applies hint penalty without going negative", () => {
    expect(applyHintPenalty(30, 2, 5, 30)).toBe(20);
    expect(applyHintPenalty(6, 5, 5, 6)).toBe(0);
  });

  it("scales percent to weight", () => {
    expect(scaleToWeight(50, 30)).toBe(15);
  });

  it("computes success rate", () => {
    expect(successRate(2, 4)).toBe(0.5);
    expect(successRate(0, 0)).toBe(0);
  });
});
