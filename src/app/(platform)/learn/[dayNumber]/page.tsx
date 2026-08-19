import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { learningService } from "@/services/learning/daily-learning-service";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LessonSteps } from "@/features/learn/lesson-steps";

export default async function DayPage({ params }: { params: Promise<{ dayNumber: string }> }) {
  const user = await requireUser();
  const { dayNumber } = await params;
  const day = await learningService.getDay(Number(dayNumber));
  const progress = await prisma.progress.findUnique({
    where: { userId_dailyLessonId: { userId: user.id, dailyLessonId: day.id } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            روز {day.dayNumber} · {day.phase.titleFa}
          </p>
          <h1 className="text-3xl font-bold">{day.titleFa}</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{day.objectiveFa}</p>
        </div>
        <Badge tone={progress?.status === "FAILED" ? "danger" : "primary"}>{progress?.status ?? "شروع نشده"}</Badge>
      </div>
      <Card>
        <CardTitle>نمره روز</CardTitle>
        <p className="mt-2 text-3xl font-bold">{Math.round(progress?.totalScore ?? 0)}/100</p>
        <Progress className="mt-3" value={progress?.totalScore ?? 0} />
      </Card>
      <LessonSteps day={day} theoryCompleted={Boolean(progress?.theoryCompleted)} />
    </div>
  );
}
