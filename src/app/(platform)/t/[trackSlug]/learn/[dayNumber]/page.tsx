import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { learningService } from "@/services/learning/daily-learning-service";
import { trackService } from "@/services/tracks/track-service";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LessonSteps } from "@/features/learn/lesson-steps";
import { DayNav } from "@/features/learn/day-nav";
import { progressBadgeTone, progressStatusFa } from "@/lib/progress-labels";

export default async function TrackDayPage({
  params,
}: {
  params: Promise<{ trackSlug: string; dayNumber: string }>;
}) {
  const user = await requireUser();
  const { trackSlug, dayNumber: dayNumberParam } = await params;
  const dayNumber = Number(dayNumberParam);
  if (!Number.isFinite(dayNumber) || dayNumber < 1) {
    notFound();
  }

  const track = await trackService.setActiveTrack(user.id, trackSlug);
  const curriculum = await learningService.listDaysWithProgress(user.id, track.id);
  const entry = curriculum.days.find((item) => item.dayNumber === dayNumber);
  if (!entry) {
    notFound();
  }
  if (!entry.unlocked) {
    redirect(`/t/${track.slug}/learn`);
  }

  const day = await learningService.getDay(track.id, dayNumber);
  const progress = await prisma.progress.findUnique({
    where: { userId_dailyLessonId: { userId: user.id, dailyLessonId: day.id } },
  });

  const index = curriculum.days.findIndex((item) => item.dayNumber === dayNumber);
  const prev = index > 0 ? curriculum.days[index - 1] : null;
  const next = index >= 0 && index < curriculum.days.length - 1 ? curriculum.days[index + 1] : null;

  return (
    <div className="space-y-6">
      <DayNav
        trackSlug={track.slug}
        dayNumber={day.dayNumber}
        prevDayNumber={prev?.dayNumber ?? null}
        nextDayNumber={next?.dayNumber ?? null}
        nextUnlocked={Boolean(next?.unlocked)}
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            روز {day.dayNumber} · {day.phase.titleFa}
            {entry.isCurrent ? " · درس امروز" : " · مرور"}
          </p>
          <h1 className="text-3xl font-bold">{day.titleFa}</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{day.objectiveFa}</p>
        </div>
        <Badge tone={progressBadgeTone(progress?.status)}>{progressStatusFa(progress?.status)}</Badge>
      </div>
      <Card>
        <CardTitle>نمره روز</CardTitle>
        <p className="mt-2 text-3xl font-bold">{Math.round(progress?.totalScore ?? 0)}/100</p>
        <Progress className="mt-3" value={progress?.totalScore ?? 0} />
        <p className="mt-2 text-sm text-muted-foreground">
          نظریه {Math.round(progress?.theoryScore ?? 0)} · عملی {Math.round(progress?.practicalScore ?? 0)} · سناریو{" "}
          {Math.round(progress?.scenarioScore ?? 0)} · آزمون {Math.round(progress?.examScore ?? 0)}
        </p>
      </Card>
      <LessonSteps
        day={day}
        theoryCompleted={Boolean(progress?.theoryCompleted)}
        userId={user.id}
        trackSlug={track.slug}
      />
    </div>
  );
}
