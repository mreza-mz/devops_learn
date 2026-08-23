type OpenReview = {
  topicId: string;
  generatedExerciseId: string | null;
  scheduledFor: Date;
};

/** One open review card per topic. Prefer the row that already has a generated exercise. */
export function uniqueOpenReviews<T extends OpenReview>(items: T[]): T[] {
  const best = new Map<string, T>();
  for (const item of items) {
    const prev = best.get(item.topicId);
    if (!prev) {
      best.set(item.topicId, item);
      continue;
    }
    const prevHasExercise = Boolean(prev.generatedExerciseId);
    const nextHasExercise = Boolean(item.generatedExerciseId);
    if (nextHasExercise !== prevHasExercise) {
      if (nextHasExercise) best.set(item.topicId, item);
      continue;
    }
    if (item.scheduledFor >= prev.scheduledFor) best.set(item.topicId, item);
  }
  return [...best.values()].sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
}
