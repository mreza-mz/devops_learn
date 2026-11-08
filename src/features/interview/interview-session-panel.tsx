"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { finishInterviewAction, submitInterviewAnswerAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  INTERVIEW_CATEGORY_LABELS,
  type InterviewCategory,
  type InterviewQuestion,
} from "@/config/interview-bank";

type Graded = {
  score: number;
  feedbackFa: string;
  mistakes: string[];
  correctExplanationFa: string;
};

type FinishReport = {
  overallScore: number;
  categoryScores: Record<string, number>;
  analysis: {
    weakTopics: string[];
    strongTopics: string[];
    summaryFa: string;
    recommendedActionsFa: string[];
  };
  recommendedLessons: { dayNumber: number; labelFa: string }[];
};

export function InterviewSessionPanel({
  sessionId,
  trackSlug,
  question,
  index,
  total,
  status,
  initialReport,
}: {
  sessionId: string;
  trackSlug: string;
  question: InterviewQuestion | null;
  index: number;
  total: number;
  status: string;
  initialReport: FinishReport | null;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<{
    grade: Graded;
    followUpFa: string | null;
    question: InterviewQuestion;
  } | null>(null);
  const [report, setReport] = useState<FinishReport | null>(initialReport);
  const [pending, start] = useTransition();

  if (status === "COMPLETED" && report) {
    return <InterviewReport trackSlug={trackSlug} report={report} />;
  }

  const showQuestion = question && !evaluation;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>
          پیشرفت: {Math.min(index + (evaluation ? 1 : 0), total)} / {total}
        </span>
        {question ? (
          <Badge>{INTERVIEW_CATEGORY_LABELS[question.category as InterviewCategory]}</Badge>
        ) : null}
      </div>

      {showQuestion ? (
        <Card className="space-y-4 p-5">
          <p className="font-medium">{question.promptFa}</p>
          <p className="text-xs text-muted-foreground">
            پس از ارسال پاسخ، نمره و بازخورد نمایش داده می‌شود (قبل از ارسال چیزی نشان داده نمی‌شود).
          </p>
          <textarea
            className="w-full rounded-lg border bg-background p-3 text-sm"
            rows={8}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="پاسخ خود را به فارسی یا انگلیسی بنویسید..."
          />
          <Button
            disabled={pending || !answer.trim()}
            onClick={() =>
              start(async () => {
                const outcome = await submitInterviewAnswerAction(sessionId, answer);
                if (!outcome.ok) {
                  alert(outcome.error);
                  return;
                }
                setEvaluation({
                  grade: outcome.data.grade,
                  followUpFa: outcome.data.followUpFa,
                  question: outcome.data.question,
                });
              })
            }
          >
            {pending ? "در حال ارزیابی..." : "ارسال پاسخ"}
          </Button>
        </Card>
      ) : null}

      {evaluation ? (
        <Card className="space-y-3 p-5">
          <p className="font-semibold">ارزیابی سؤال {index + 1}</p>
          <p className="text-sm">
            نمره: <span className="font-bold">{Math.round(evaluation.grade.score)}</span> از ۱۰۰
          </p>
          <p className="text-sm text-muted-foreground">{evaluation.grade.feedbackFa}</p>
          {evaluation.grade.mistakes.length ? (
            <ul className="list-inside list-disc text-sm text-destructive">
              {evaluation.grade.mistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
          <p className="text-sm">{evaluation.grade.correctExplanationFa}</p>
          {evaluation.followUpFa ? (
            <p className="rounded-lg bg-muted p-3 text-sm">
              <span className="font-medium">سؤال پیگیری: </span>
              {evaluation.followUpFa}
            </p>
          ) : null}
          <InterviewNextActions
            completed={index + 1 >= total}
            pending={pending}
            onNext={() => {
              setEvaluation(null);
              setAnswer("");
              router.refresh();
            }}
            onFinish={() =>
              start(async () => {
                const outcome = await finishInterviewAction(sessionId);
                if (!outcome.ok) {
                  alert(outcome.error);
                  return;
                }
                setReport({
                  overallScore: outcome.data.overallScore,
                  categoryScores: outcome.data.categoryScores,
                  analysis: outcome.data.analysis,
                  recommendedLessons: outcome.data.recommendedLessons,
                });
              })
            }
          />
        </Card>
      ) : null}

      {!question && !evaluation && status === "IN_PROGRESS" ? (
        <Card className="p-5">
          <p className="mb-3">همهٔ سؤالات پاسخ داده شد. گزارش نهایی را دریافت کنید.</p>
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const outcome = await finishInterviewAction(sessionId);
                if (!outcome.ok) {
                  alert(outcome.error);
                  return;
                }
                setReport({
                  overallScore: outcome.data.overallScore,
                  categoryScores: outcome.data.categoryScores,
                  analysis: outcome.data.analysis,
                  recommendedLessons: outcome.data.recommendedLessons,
                });
              })
            }
          >
            {pending ? "در حال ساخت گزارش..." : "پایان و گزارش"}
          </Button>
        </Card>
      ) : null}
    </div>
  );
}

function InterviewNextActions({
  completed,
  pending,
  onNext,
  onFinish,
}: {
  completed: boolean;
  pending: boolean;
  onNext: () => void;
  onFinish: () => void;
}) {
  if (completed) {
    return (
      <Button disabled={pending} onClick={onFinish}>
        {pending ? "در حال ساخت گزارش..." : "پایان و گزارش نهایی"}
      </Button>
    );
  }
  return (
    <Button variant="outline" onClick={onNext}>
      سؤال بعدی
    </Button>
  );
}

function InterviewReport({ trackSlug, report }: { trackSlug: string; report: FinishReport }) {
  return (
    <Card className="space-y-4 p-5">
      <h2 className="text-xl font-bold">گزارش مصاحبه</h2>
      <p className="text-lg">
        نمره کلی: <span className="font-bold">{Math.round(report.overallScore)}</span>٪
      </p>
      <p className="text-sm text-muted-foreground">{report.analysis.summaryFa}</p>
      <div className="grid gap-2 md:grid-cols-2">
        {Object.entries(report.categoryScores).map(([cat, score]) => (
          <h3 key={cat} className="text-sm">
            {INTERVIEW_CATEGORY_LABELS[cat as InterviewCategory] ?? cat}: {score}٪
          </h3>
        ))}
      </div>
      {report.analysis.strongTopics.length ? (
        <p className="text-sm">
          نقاط قوت: {report.analysis.strongTopics.join("، ")}
        </p>
      ) : null}
      {report.analysis.weakTopics.length ? (
        <p className="text-sm">
          نیاز به تمرین: {report.analysis.weakTopics.join("، ")}
        </p>
      ) : null}
      {report.recommendedLessons.length ? (
        <ul className="list-inside list-disc text-sm">
          {report.recommendedLessons.map((rec) => (
            <li key={rec.dayNumber}>
              <a className="text-primary underline" href={`/t/${trackSlug}/learn/${rec.dayNumber}`}>
                {rec.labelFa}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
