import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SafeMarkdown } from "@/components/safe-markdown";
import { CompleteTheoryButton } from "@/features/learn/complete-theory-button";
import type { learningService } from "@/services/learning/daily-learning-service";

type Day = Awaited<ReturnType<typeof learningService.getDay>>;

const difficultyFa: Record<string, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
};

function exercisesForLesson(lesson: Day["lessons"][number], exercises: Day["exercises"], useLessonSlug: boolean) {
  if (useLessonSlug) {
    return exercises.filter((exercise) => exercise.lessonSlug === lesson.slug);
  }
  return exercises.filter((exercise) => exercise.topicId && exercise.topicId === lesson.topicId);
}

export function LessonSteps({
  day,
  theoryCompleted,
}: {
  day: Day;
  theoryCompleted: boolean;
}) {
  const useLessonSlug = day.exercises.some((exercise) => exercise.lessonSlug);
  const grouped = day.lessons.map((lesson) => ({
    lesson,
    exercises: exercisesForLesson(lesson, day.exercises, useLessonSlug),
  }));
  const shownIds = new Set(grouped.flatMap((item) => item.exercises.map((exercise) => exercise.id)));
  const leftover = day.exercises.filter((exercise) => !shownIds.has(exercise.id));
  const totalSteps = day.lessons.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>مسیر امروز</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          هر قدم را بخوانید، بعد همان‌جا تمرین‌های همان قدم را انجام دهید. لازم نیست همه را یکجا حفظ کنید.
        </p>
        <ol className="mt-4 space-y-2 text-sm">
          {day.lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <a className="text-primary" href={`#lesson-${lesson.slug}`}>
                قدم {index + 1} · {lesson.titleFa}
              </a>
            </li>
          ))}
        </ol>
      </Card>

      {grouped.map(({ lesson, exercises }, index) => (
        <section key={lesson.id} id={`lesson-${lesson.slug}`} className="scroll-mt-6 space-y-4">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">
                قدم {index + 1} از {totalSteps}
              </Badge>
            </div>
            <CardTitle className="mt-3">{lesson.titleFa}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{lesson.objectiveFa}</p>
            <div className="mt-4">
              <h3 className="font-semibold">نظریه</h3>
              <SafeMarkdown content={lesson.theoryMd} />
              <h3 className="mt-4 font-semibold">در ترمینال چه کار می‌کنید؟</h3>
              <SafeMarkdown content={lesson.practicalMd} />
              <h3 className="mt-4 font-semibold">مثال</h3>
              <SafeMarkdown content={lesson.exampleMd} />
            </div>
          </Card>

          {exercises.length > 0 ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardTitle>تمرین همین قدم</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                نظریه را ببندید و این تمرین‌ها را در آزمایشگاه انجام دهید. بعد به قدم بعدی برگردید.
              </p>
              <ol className="mt-4 space-y-3">
                {exercises.map((exercise, exerciseIndex) => (
                  <li key={exercise.id} className="rounded-xl border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">
                        {exerciseIndex + 1}. {exercise.titleFa}
                      </p>
                      <Badge tone="muted">{difficultyFa[exercise.difficulty] ?? exercise.difficulty}</Badge>
                    </div>
                    <Link
                      className="mt-3 inline-block text-sm text-primary"
                      href={`/learn/${day.dayNumber}/exercise/${exercise.id}`}
                    >
                      شروع تمرین
                    </Link>
                  </li>
                ))}
              </ol>
            </Card>
          ) : null}
        </section>
      ))}

      <Card>
        <CardTitle>نظریه تمام شد؟</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          اگر هر {totalSteps} قدم را خواندید، نظریه را ثبت کنید. تمرین‌ها نمرهٔ عملی جدا دارند.
        </p>
        <div className="mt-4">
          <CompleteTheoryButton dayNumber={day.dayNumber} done={theoryCompleted} />
        </div>
      </Card>

      {leftover.length > 0 ? (
        <Card>
          <CardTitle>تمرین‌های دیگر</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {leftover.map((exercise) => (
              <li key={exercise.id}>
                <Link className="text-primary" href={`/learn/${day.dayNumber}/exercise/${exercise.id}`}>
                  {exercise.titleFa}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>سناریوی تولید</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">بعد از تمرین‌های قدم‌به‌قدم، یک مسئلهٔ واقعی‌تر حل کنید.</p>
          {day.scenario ? (
            <Link className="mt-3 inline-block text-primary" href={`/learn/${day.dayNumber}/scenario`}>
              {day.scenario.titleFa}
            </Link>
          ) : null}
        </Card>
        <Card>
          <CardTitle>آزمون پایان روز</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">وقتی تمرین و سناریو تمام شد، آزمون را بدهید.</p>
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
