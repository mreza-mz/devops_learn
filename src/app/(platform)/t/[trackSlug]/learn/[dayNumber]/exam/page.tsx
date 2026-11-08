import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { learningService } from "@/services/learning/daily-learning-service";
import { trackService } from "@/services/tracks/track-service";
import { ExamForm } from "@/features/exam/exam-form";

export default async function TrackExamPage({
  params,
}: {
  params: Promise<{ trackSlug: string; dayNumber: string }>;
}) {
  await requireUser();
  const { trackSlug, dayNumber } = await params;
  const track = await trackService.getBySlug(trackSlug);
  const day = await learningService.getDay(track.id, Number(dayNumber));
  if (!day.exam) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{day.exam.titleFa}</h1>
      <p className="text-muted-foreground">
        سؤالات کوتاه‌پاسخ با موتور قطعی یا AvalAI نمره می‌گیرند. حد قبولی آزمون {day.exam.passingScore}٪ است.
      </p>
      <ExamForm
        examId={day.exam.id}
        timeLimitSec={day.exam.timeLimitSec}
        questions={day.exam.questions.map((question) => ({
          id: question.id,
          type: question.type,
          promptFa: question.promptFa,
          optionsJson: question.optionsJson,
          points: question.points,
        }))}
      />
    </div>
  );
}
