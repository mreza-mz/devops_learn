import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/server/auth/guards";
import { TRACK_SLUGS } from "@/config/tracks";
import { interviewService } from "@/services/interview/interview-service";
import { InterviewSessionPanel } from "@/features/interview/interview-session-panel";
import { INTERVIEW_CATEGORY_LABELS, type InterviewCategory } from "@/config/interview-bank";

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ trackSlug: string; sessionId: string }>;
}) {
  const user = await requireUser();
  const { trackSlug, sessionId } = await params;
  if (trackSlug !== TRACK_SLUGS.BACKEND_GO) {
    notFound();
  }

  const session = await interviewService.getSession(user.id, sessionId);
  if (session.track.slug !== trackSlug) {
    notFound();
  }

  const current = interviewService.getCurrentQuestion(session);
  const categoryScores =
    session.categoryScoresJson && typeof session.categoryScoresJson === "object"
      ? (session.categoryScoresJson as Record<string, number>)
      : {};

  const initialReport =
    session.status === "COMPLETED" && session.overallScore != null
      ? {
          overallScore: session.overallScore,
          categoryScores,
          analysis: {
            weakTopics: Array.isArray(session.weaknessesJson) ? (session.weaknessesJson as string[]) : [],
            strongTopics: Array.isArray(session.strengthsJson) ? (session.strengthsJson as string[]) : [],
            summaryFa: session.reportSummaryFa ?? "",
            recommendedActionsFa: [],
          },
          recommendedLessons: Array.isArray(session.recommendedLessonsJson)
            ? (session.recommendedLessonsJson as { dayNumber: number; labelFa: string }[])
            : [],
        }
      : null;

  const ids = interviewService.getQuestionIds(session);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">جلسه مصاحبه</h1>
        <Link href={`/t/${trackSlug}/interview`} className="text-sm text-muted-foreground hover:underline">
          بازگشت
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        حالت: {session.mode === "quick" ? "سریع" : "استاندارد"} — {ids.length} سؤال
      </p>
      {current?.question ? (
        <p className="text-xs text-muted-foreground">
          دسته: {INTERVIEW_CATEGORY_LABELS[current.question.category as InterviewCategory]}
        </p>
      ) : null}
      <InterviewSessionPanel
        sessionId={session.id}
        trackSlug={trackSlug}
        question={current?.question ?? null}
        index={current?.index ?? ids.length}
        total={ids.length}
        status={session.status}
        initialReport={initialReport}
      />
    </div>
  );
}
