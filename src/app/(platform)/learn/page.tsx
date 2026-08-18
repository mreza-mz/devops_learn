import Link from "next/link";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { learningService } from "@/services/learning/daily-learning-service";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SafeMarkdown } from "@/components/safe-markdown";
import { CompleteTheoryButton } from "@/features/learn/complete-theory-button";

export default async function LearnIndexPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId: user.id } });
  const day = await learningService.getDay(profile.currentDayNumber);
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
        <p className="mt-2 text-sm text-muted-foreground">
          نظریه {Math.round(progress?.theoryScore ?? 0)} · عملی {Math.round(progress?.practicalScore ?? 0)} · سناریو{" "}
          {Math.round(progress?.scenarioScore ?? 0)} · آزمون {Math.round(progress?.examScore ?? 0)}
        </p>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {day.lessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardTitle>{lesson.titleFa}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{lesson.objectiveFa}</p>
            <div className="mt-4">
              <h3 className="font-semibold">نظریه</h3>
              <SafeMarkdown content={lesson.theoryMd} />
              <h3 className="mt-4 font-semibold">توضیح عملی</h3>
              <SafeMarkdown content={lesson.practicalMd} />
              <h3 className="mt-4 font-semibold">مثال</h3>
              <SafeMarkdown content={lesson.exampleMd} />
            </div>
          </Card>
        ))}
      </div>
      <CompleteTheoryButton dayNumber={day.dayNumber} done={Boolean(progress?.theoryCompleted)} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle>تمرین‌های عملی</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {day.exercises.map((exercise) => (
              <li key={exercise.id}>
                <Link className="text-primary" href={`/learn/${day.dayNumber}/exercise/${exercise.id}`}>
                  {exercise.titleFa}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>سناریوی تولید</CardTitle>
          {day.scenario ? (
            <Link className="mt-3 inline-block text-primary" href={`/learn/${day.dayNumber}/scenario`}>
              {day.scenario.titleFa}
            </Link>
          ) : null}
        </Card>
        <Card>
          <CardTitle>آزمون پایان روز</CardTitle>
          {day.exam ? (
            <Link className="mt-3 inline-block text-primary" href={`/learn/${day.dayNumber}/exam`}>
              {day.exam.titleFa}
            </Link>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
