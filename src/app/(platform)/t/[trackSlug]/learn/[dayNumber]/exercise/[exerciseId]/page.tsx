import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { trackService } from "@/services/tracks/track-service";
import { Card, CardTitle } from "@/components/ui/card";
import { SafeMarkdown } from "@/components/safe-markdown";
import { StartLab } from "@/features/learn/start-lab";
import type { Hint } from "@/types/domain";
import { trackLearnHref } from "@/config/tracks";

export default async function TrackExercisePage({
  params,
}: {
  params: Promise<{ trackSlug: string; dayNumber: string; exerciseId: string }>;
}) {
  await requireUser();
  const { trackSlug, dayNumber, exerciseId } = await params;
  const track = await trackService.getBySlug(trackSlug);
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) {
    notFound();
  }
  if (!exercise.dailyLessonId) {
    redirect(`/t/${track.slug}/reviews/exercise/${exercise.id}`);
  }
  const hints = (exercise.hintsJson as Hint[]) ?? [];
  const lesson = exercise.lessonSlug
    ? await prisma.lesson.findFirst({
        where: {
          slug: exercise.lessonSlug,
          dailyLesson: { trackId: track.id, dayNumber: Number(dayNumber) },
        },
        select: { titleFa: true, slug: true },
      })
    : null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <Link
          className="text-primary"
          href={`${trackLearnHref(track.slug, Number(dayNumber))}${lesson ? `#lesson-${lesson.slug}` : ""}`}
        >
          بازگشت به درس روز {dayNumber}
        </Link>
        {lesson ? ` · ${lesson.titleFa}` : null}
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm text-muted-foreground">روز {dayNumber}</p>
          <CardTitle>{exercise.titleFa}</CardTitle>
          <div className="mt-4">
            <SafeMarkdown content={exercise.instructionsMd} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            هدف را در ترمینال آزمایشگاه خودتان پیدا کنید و اجرا کنید. دستور آماده در متن تمرین نیست؛ اگر گیر
            کردید از «نمایش راهنمایی بعدی» استفاده کنید (هر راهنمایی نمره را کم می‌کند).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">قوانین اعتبارسنجی مخفی هستند.</p>
        </Card>
        <Card>
          <CardTitle>ترمینال آزمایشگاه</CardTitle>
          <div className="mt-4">
            <StartLab exerciseId={exercise.id} hints={hints} />
          </div>
        </Card>
      </div>
    </div>
  );
}
