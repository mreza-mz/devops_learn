import Link from "next/link";
import { requireUser } from "@/server/auth/guards";
import { learningService } from "@/services/learning/daily-learning-service";
import { trackService } from "@/services/tracks/track-service";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CurriculumDays } from "@/features/learn/curriculum-days";
import { progressBadgeTone, progressStatusFa } from "@/lib/progress-labels";
import { trackLearnHref } from "@/config/tracks";

export default async function TrackLearnIndexPage({ params }: { params: Promise<{ trackSlug: string }> }) {
  const user = await requireUser();
  const { trackSlug } = await params;
  const track = await trackService.setActiveTrack(user.id, trackSlug);
  const curriculum = await learningService.listDaysWithProgress(user.id, track.id);
  const today = curriculum.days.find((day) => day.isCurrent) ?? curriculum.days[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">درس‌ها</h1>
        <p className="mt-1 text-muted-foreground">{track.titleFa}</p>
      </div>

      {today ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">درس امروز · روز {today.dayNumber}</p>
              <CardTitle className="mt-1">{today.titleFa}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{today.phaseTitleFa}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={progressBadgeTone(today.status)}>{progressStatusFa(today.status)}</Badge>
              <span className="text-sm text-muted-foreground">
                نمره {today.status ? Math.round(today.latestScore) : "—"}
              </span>
              <Link
                href={trackLearnHref(track.slug, today.dayNumber)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                ادامه درس امروز
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      <CurriculumDays curriculum={curriculum} trackSlug={track.slug} />
    </div>
  );
}
