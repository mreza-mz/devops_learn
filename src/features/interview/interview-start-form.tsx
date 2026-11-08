"use client";

import { useTransition } from "react";
import { startInterviewAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { INTERVIEW_MODE_COUNTS, type InterviewMode } from "@/config/interview-bank";

const MODES: { mode: InterviewMode; titleFa: string; descriptionFa: string }[] = [
  {
    mode: "quick",
    titleFa: "سریع",
    descriptionFa: `${INTERVIEW_MODE_COUNTS.quick} سؤال ترکیبی از همهٔ دسته‌ها — مناسب مرور روزانه.`,
  },
  {
    mode: "standard",
    titleFa: "استاندارد",
    descriptionFa: `${INTERVIEW_MODE_COUNTS.standard} سؤال با پوشش متنوع — شبیه‌تر به یک راند مصاحبه واقعی.`,
  },
];

export function InterviewStartForm({ trackSlug }: { trackSlug: string }) {
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {MODES.map((item) => (
        <Card key={item.mode} className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{item.titleFa}</h2>
            <Badge>{INTERVIEW_MODE_COUNTS[item.mode]} سؤال</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{item.descriptionFa}</p>
          <Button
            disabled={pending}
            onClick={() => start(() => void startInterviewAction(trackSlug, item.mode))}
          >
            {pending ? "در حال شروع..." : "شروع جلسه"}
          </Button>
        </Card>
      ))}
    </div>
  );
}
