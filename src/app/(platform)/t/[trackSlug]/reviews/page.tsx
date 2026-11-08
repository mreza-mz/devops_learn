import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { trackService } from "@/services/tracks/track-service";
import { Card, CardTitle } from "@/components/ui/card";
import { GenerateReviewButton } from "@/features/learn/generate-review-button";
import { uniqueOpenReviews } from "@/services/progress/review-queue";
import Link from "next/link";

export default async function TrackReviewsPage({ params }: { params: Promise<{ trackSlug: string }> }) {
  const user = await requireUser();
  const { trackSlug } = await params;
  const track = await trackService.setActiveTrack(user.id, trackSlug);
  const rows = await prisma.reviewQueue.findMany({
    where: { userId: user.id, completed: false, topic: { trackId: track.id } },
    include: { topic: true, generatedExercise: true },
    orderBy: { scheduledFor: "asc" },
  });
  const items = uniqueOpenReviews(rows);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">صف مرور — {track.titleFa}</h1>
      <p className="text-muted-foreground">موضوعات ضعیف همین مسیر اینجا می‌آیند.</p>
      {items.length === 0 ? <p>مورد بازی برای مرور نیست.</p> : null}
      {items.map((item) => (
        <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>{item.topic.titleFa}</CardTitle>
            <p className="text-sm text-muted-foreground">{item.reason}</p>
            {item.generatedExercise ? (
              <Link className="text-sm text-primary" href={`/reviews/exercise/${item.generatedExercise.id}`}>
                {item.generatedExercise.titleFa}
              </Link>
            ) : null}
          </div>
          <GenerateReviewButton topicId={item.topicId} />
        </Card>
      ))}
    </div>
  );
}
