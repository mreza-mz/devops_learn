import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { progressBadgeTone, progressStatusFa } from "@/lib/progress-labels";
import { trackLearnHref } from "@/config/tracks";
import type { learningService } from "@/services/learning/daily-learning-service";

type Curriculum = Awaited<ReturnType<typeof learningService.listDaysWithProgress>>;
type DayItem = Curriculum["days"][number];

function DayRow({ day, trackSlug }: { day: DayItem; trackSlug: string }) {
  const locked = !day.unlocked;
  const href = trackLearnHref(trackSlug, day.dayNumber);
  const score = day.status ? Math.round(day.latestScore) : null;
  const best = day.status ? Math.round(day.bestScore) : null;

  const body = (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
        day.isCurrent ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      } ${locked ? "opacity-55" : "hover:border-primary/50 hover:bg-muted/30"}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">روز {day.dayNumber}</span>
          {day.isCurrent ? <Badge tone="primary">امروز</Badge> : null}
          <Badge tone={progressBadgeTone(day.status, locked)}>{progressStatusFa(day.status, locked)}</Badge>
        </div>
        <p className="mt-1 font-medium">{day.titleFa}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{day.objectiveFa}</p>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-sm">
        <div className="text-left">
          <p className="text-xs text-muted-foreground">نمره</p>
          <p className="font-semibold">{score == null ? "—" : score}</p>
        </div>
        <div className="text-left">
          <p className="text-xs text-muted-foreground">بهترین</p>
          <p className="font-semibold">{best == null ? "—" : best}</p>
        </div>
        <span className={`text-sm ${locked ? "text-muted-foreground" : "text-primary"}`}>
          {locked ? "قفل" : day.isCurrent ? "ادامه" : day.status ? "مرور" : "شروع"}
        </span>
      </div>
    </div>
  );

  if (locked) {
    return <div aria-disabled="true">{body}</div>;
  }

  return (
    <Link href={href} className="block">
      {body}
    </Link>
  );
}

export function CurriculumDays({ curriculum, trackSlug }: { curriculum: Curriculum; trackSlug: string }) {
  return (
    <div className="space-y-6">
      {curriculum.phases.map((phase) => (
        <Card key={phase.id}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <CardTitle>{phase.titleFa}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{phase.titleEn}</p>
            </div>
            <p className="text-xs text-muted-foreground">{phase.days.length} درس</p>
          </div>
          <ul className="mt-4 space-y-2">
            {phase.days.map((day) => (
              <li key={day.id}>
                <DayRow day={day} trackSlug={trackSlug} />
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
