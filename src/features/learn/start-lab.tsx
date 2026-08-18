"use client";

import { useState, useTransition } from "react";
import { startExerciseAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { LabTerminal } from "@/features/terminal/lab-terminal";
import type { Hint } from "@/types/domain";

export function StartLab({
  exerciseId,
  hints,
}: {
  exerciseId: string;
  hints: Hint[];
}) {
  const [session, setSession] = useState<{
    labId: string;
    token: string;
    gatewayUrl: string;
    remainingSec: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (session) {
    return (
      <LabTerminal
        mode="exercise"
        labId={session.labId}
        token={session.token}
        gatewayUrl={session.gatewayUrl}
        remainingSec={session.remainingSec}
        hints={hints}
      />
    );
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await startExerciseAction(exerciseId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setSession({
              labId: result.data.lab.id,
              token: result.data.token,
              gatewayUrl: result.data.gatewayUrl,
              remainingSec: result.data.remainingSec,
            });
          })
        }
      >
        {pending ? "در حال ساخت آزمایشگاه..." : "شروع ترمینال ایزوله"}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <p className="text-xs text-muted-foreground">
        فرمان‌ها فقط داخل کانتینر Docker اجرا می‌شوند، نه روی ویندوز میزبان. Docker Desktop باید روشن باشد.
      </p>
    </div>
  );
}
