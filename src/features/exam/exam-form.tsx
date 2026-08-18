"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitExamAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Question = {
  id: string;
  type: string;
  promptFa: string;
  optionsJson: unknown;
  points: number;
};

export function ExamForm({ examId, questions, timeLimitSec }: { examId: string; questions: Question[]; timeLimitSec: number }) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const outcome = await submitExamAction(examId, responses, Math.round((Date.now() - startedAt.current) / 1000));
          if (!outcome.ok) {
            setResult(outcome.error);
            return;
          }
          setResult(`نمره آزمون: ${Math.round(outcome.data.graded.percent)} — وضعیت: ${outcome.data.status}`);
        });
      }}
    >
      <p className="text-sm text-muted-foreground">مهلت حدودی: {Math.round(timeLimitSec / 60)} دقیقه</p>
      {questions.map((question, index) => {
        const options = Array.isArray(question.optionsJson) ? (question.optionsJson as string[]) : [];
        return (
          <Card key={question.id}>
            <p className="font-medium">
              {index + 1}. {question.promptFa} <span className="text-xs text-muted-foreground">({question.points} نمره)</span>
            </p>
            {options.length ? (
              <div className="mt-3 space-y-2">
                {options.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      onChange={(event) => setResponses((current) => ({ ...current, [question.id]: event.target.value }))}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="mt-3 w-full rounded-lg border bg-background p-3 text-sm"
                rows={3}
                onChange={(event) => setResponses((current) => ({ ...current, [question.id]: event.target.value }))}
              />
            )}
          </Card>
        );
      })}
      <Button type="submit" disabled={pending}>
        {pending ? "در حال نمره‌دهی..." : "ثبت آزمون"}
      </Button>
      {result ? <p className="rounded-lg bg-muted p-3">{result}</p> : null}
    </form>
  );
}
