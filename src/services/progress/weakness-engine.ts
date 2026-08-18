import { DEFAULT_WEAKNESS_THRESHOLD } from "@/config/constants";

export type TopicPerformance = {
  topicId: string;
  topicSlug?: string;
  scoreAvg: number;
  sampleCount: number;
};

export function updateTopicAverage(previousAvg: number, sampleCount: number, newScore: number): {
  scoreAvg: number;
  sampleCount: number;
} {
  const nextCount = sampleCount + 1;
  const scoreAvg = (previousAvg * sampleCount + newScore) / nextCount;
  return { scoreAvg, sampleCount: nextCount };
}

export function isWeakTopic(scoreAvg: number, threshold = DEFAULT_WEAKNESS_THRESHOLD): boolean {
  return scoreAvg < threshold;
}

export function detectWeakTopics(
  performances: TopicPerformance[],
  threshold = DEFAULT_WEAKNESS_THRESHOLD,
): TopicPerformance[] {
  return performances.filter((item) => item.sampleCount > 0 && isWeakTopic(item.scoreAvg, threshold));
}

export function detectStrongTopics(
  performances: TopicPerformance[],
  threshold = 0.85,
): TopicPerformance[] {
  return performances.filter((item) => item.sampleCount > 0 && item.scoreAvg >= threshold);
}

export function shouldScheduleReview(scoreAvg: number, threshold = DEFAULT_WEAKNESS_THRESHOLD): boolean {
  return isWeakTopic(scoreAvg, threshold);
}
