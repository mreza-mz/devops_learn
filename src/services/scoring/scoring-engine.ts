import { clamp, roundScore } from "@/lib/utils";
import type { DailyScoreParts, ScoreClassification, ScoreThresholds } from "@/types/domain";

export function computeDailyTotal(parts: DailyScoreParts): number {
  return roundScore(
    clamp(parts.theory, 0, 20) +
      clamp(parts.practical, 0, 30) +
      clamp(parts.scenario, 0, 20) +
      clamp(parts.exam, 0, 30),
  );
}

export function classifyScore(total: number, thresholds: ScoreThresholds): ScoreClassification {
  if (total >= thresholds.excellentScore) {
    return "excellent";
  }
  if (total >= thresholds.passingScore) {
    return "passed";
  }
  return "failed";
}

export function applyHintPenalty(baseScore: number, hintsUsed: number, penalty: number, maxScore: number): number {
  return roundScore(clamp(baseScore - hintsUsed * penalty, 0, maxScore));
}

export function scaleToWeight(rawPercent: number, weight: number): number {
  return roundScore(clamp(rawPercent, 0, 100) * (weight / 100));
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return roundScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function successRate(passed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return roundScore(passed / total);
}

export function xpForDailyResult(classification: ScoreClassification): number {
  if (classification === "excellent") {
    return 40;
  }
  if (classification === "passed") {
    return 25;
  }
  return 8;
}
