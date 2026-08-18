"use client";

import { useState, useTransition } from "react";
import { startScenarioAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { LabTerminal } from "@/features/terminal/lab-terminal";

export function StartScenarioLab({ scenarioId }: { scenarioId: string }) {
  const [session, setSession] = useState<{ labId: string; token: string; gatewayUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (session) {
    return (
      <LabTerminal
        mode="scenario"
        labId={session.labId}
        token={session.token}
        gatewayUrl={session.gatewayUrl}
        remainingSec={1800}
        hints={[]}
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
            const result = await startScenarioAction(scenarioId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setSession({
              labId: result.data.lab.id,
              token: result.data.token,
              gatewayUrl: result.data.gatewayUrl,
            });
          })
        }
      >
        {pending ? "در حال آماده‌سازی حادثه..." : "ورود به محیط حادثه"}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
