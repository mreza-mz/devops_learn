import type { LevelRequirements } from "@/types/domain";

export type LearnerStats = {
  examAverage: number;
  practicalSuccessRate: number;
  scenariosPassed: number;
  projectsCompleted: number;
  streak: number;
  weakTopicCount: number;
  currentLevelOrder: number;
  xp: number;
};

export function canUnlockLevel(stats: LearnerStats, requirements: LevelRequirements, minXp: number): boolean {
  if (stats.xp < minXp) {
    return false;
  }
  if (stats.currentLevelOrder < requirements.previousLevelOrder) {
    return false;
  }
  return (
    stats.examAverage >= requirements.minExamAverage &&
    stats.practicalSuccessRate >= requirements.minPracticalSuccessRate &&
    stats.scenariosPassed >= requirements.minScenariosPassed &&
    stats.projectsCompleted >= requirements.minProjectsCompleted &&
    stats.streak >= requirements.minStreak &&
    stats.weakTopicCount <= requirements.weakTopicMax
  );
}

export function nextStreak(lastStudyDate: Date | null, now: Date, previousStreak: number): number {
  if (!lastStudyDate) {
    return 1;
  }
  const last = new Date(lastStudyDate);
  const lastDay = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffDays = Math.round((today - lastDay) / 86_400_000);
  if (diffDays === 0) {
    return previousStreak || 1;
  }
  if (diffDays === 1) {
    return previousStreak + 1;
  }
  return 1;
}
