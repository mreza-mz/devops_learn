import Link from "next/link";
import { requireUser } from "@/server/auth/guards";
import { progressEngine } from "@/services/progress/progress-engine";
import { trackService } from "@/services/tracks/track-service";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PhaseChart, TopicChart, WeeklyChart } from "@/features/dashboard/charts";
import { toPercent } from "@/lib/utils";
import { trackLearnHref } from "@/config/tracks";

export default async function TrackDashboardPage({ params }: { params: Promise<{ trackSlug: string }> }) {
  const user = await requireUser();
  const { trackSlug } = await params;
  const track = await trackService.setActiveTrack(user.id, trackSlug);
  const data = await progressEngine.dashboard(user.id, track.id);
  const current = data.progressRows.find((row) => row.dailyLessonId === data.daily?.id);
  const topicData = data.skills.slice(0, 8).map((item) => ({
    name: item.topic.titleFa,
    score: toPercent(item.scoreAvg),
  }));
  const phaseMap = new Map<string, { total: number; done: number }>();
  for (const row of data.progressRows) {
    const name = row.dailyLesson.phase.titleFa;
    const currentPhase = phaseMap.get(name) ?? { total: 0, done: 0 };
    currentPhase.total += 1;
    if (row.status === "PASSED" || row.status === "EXCELLENT") currentPhase.done += 1;
    phaseMap.set(name, currentPhase);
  }
  const practical = data.completedExercises;
  const practicalRate = data.completedExercises === 0 ? 0 : Math.round((practical / Math.max(practical, 1)) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">داشبورد</h1>
        <p className="text-muted-foreground">{data.track.titleFa}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-muted-foreground">سطح فعلی</p>
          <CardTitle>{data.profile.currentLevel?.titleFa ?? "شروع"}</CardTitle>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">روز / فاز</p>
          <CardTitle>
            روز {data.trackProgress.currentDayNumber} — {data.daily?.phase.titleFa ?? "—"}
          </CardTitle>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">نمره امروز</p>
          <CardTitle>{Math.round(current?.totalScore ?? 0)}/100</CardTitle>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Streak / XP</p>
          <CardTitle>
            {data.trackProgress.streak} روز · {data.trackProgress.xp} XP
          </CardTitle>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>نمره هفتگی</CardTitle>
          <WeeklyChart data={data.weekly} />
        </Card>
        <Card>
          <CardTitle>پیشرفت مسیر</CardTitle>
          <p className="mt-4 text-4xl font-bold">{data.overallProgress}%</p>
          <Progress className="mt-3" value={data.overallProgress} />
          <div className="mt-4 space-y-2 text-sm">
            <p>درس کامل‌شده: {data.completedLessons}</p>
            <p>تمرین موفق: {data.completedExercises}</p>
            <p>سناریوی موفق: {data.completedScenarios}</p>
            <p>نرخ موفقیت عملی: {practicalRate}%</p>
          </div>
          {data.daily ? (
            <Link
              href={trackLearnHref(track.slug, data.trackProgress.currentDayNumber)}
              className="mt-4 inline-block text-primary"
            >
              ادامه درس امروز
            </Link>
          ) : null}
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>عملکرد موضوع</CardTitle>
          <TopicChart data={topicData} />
        </Card>
        <Card>
          <CardTitle>تکمیل فاز</CardTitle>
          <PhaseChart
            data={[...phaseMap.entries()].map(([name, value]) => ({
              name,
              value: value.total ? Math.round((value.done / value.total) * 100) : 0,
            }))}
          />
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>موضوعات ضعیف</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.analysis.weakTopics.length ? (
              data.analysis.weakTopics.map((topic) => (
                <Badge key={topic} tone="danger">
                  {topic}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">ضعف ثبت‌شده‌ای نیست.</p>
            )}
          </div>
          <p className="mt-4 text-sm">{data.analysis.summaryFa}</p>
        </Card>
        <Card>
          <CardTitle>پیشنهاد بعدی</CardTitle>
          <p className="mt-3">{data.plan.nextDaySuggestionFa}</p>
          <p className="mt-2 text-sm text-muted-foreground">{data.plan.reviewPlanFa}</p>
        </Card>
      </div>
    </div>
  );
}
