import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { GenerateReviewButton } from "@/features/learn/generate-review-button";
import { uniqueOpenReviews } from "@/services/progress/review-queue";
import Link from "next/link";

export default async function ReviewsPage() {
  const user = await requireUser();
  const rows = await prisma.reviewQueue.findMany({
    where: { userId: user.id, completed: false },
    include: { topic: true, generatedExercise: true },
    orderBy: { scheduledFor: "asc" },
  });
  const items = uniqueOpenReviews(rows);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">صف مرور</h1>
      <p className="text-muted-foreground">موضوعات ضعیف به‌صورت خودکار اینجا می‌آیند. تمرین جدید تکرار عین سؤال قبلی نیست.</p>
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
