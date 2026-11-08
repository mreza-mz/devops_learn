"use client";

import { useState, useTransition } from "react";
import { completeTheoryAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function CompleteTheoryButton({
  trackSlug,
  dayNumber,
  done,
}: {
  trackSlug: string;
  dayNumber: number;
  done: boolean;
}) {
  const [isDone, setIsDone] = useState(done);
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      disabled={isDone || pending}
      onClick={() =>
        start(async () => {
          await completeTheoryAction(trackSlug, dayNumber);
          setIsDone(true);
        })
      }
    >
      {isDone ? "نظریه ثبت شد (۲۰ امتیاز)" : pending ? "در حال ثبت..." : "نظریه را خواندم"}
    </Button>
  );
}
