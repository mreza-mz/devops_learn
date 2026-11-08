import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { learningService } from "@/services/learning/daily-learning-service";
import { trackService } from "@/services/tracks/track-service";
import { Card, CardTitle } from "@/components/ui/card";
import { SafeMarkdown } from "@/components/safe-markdown";
import { StartScenarioLab } from "@/features/learn/start-scenario";

export default async function TrackScenarioPage({
  params,
}: {
  params: Promise<{ trackSlug: string; dayNumber: string }>;
}) {
  await requireUser();
  const { trackSlug, dayNumber } = await params;
  const track = await trackService.getBySlug(trackSlug);
  const day = await learningService.getDay(track.id, Number(dayNumber));
  if (!day.scenario) {
    notFound();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <CardTitle>{day.scenario.titleFa}</CardTitle>
        <section>
          <h3 className="font-semibold">شرح حادثه</h3>
          <SafeMarkdown content={day.scenario.incidentMd} />
        </section>
        <section>
          <h3 className="font-semibold">علائم</h3>
          <SafeMarkdown content={day.scenario.symptomsMd} />
        </section>
        <section>
          <h3 className="font-semibold">مشاهده‌پذیری موجود</h3>
          <SafeMarkdown content={day.scenario.observabilityMd} />
        </section>
        <section>
          <h3 className="font-semibold">محیط</h3>
          <SafeMarkdown content={day.scenario.environmentMd} />
        </section>
        <p className="text-xs text-muted-foreground">علت ریشه‌ای تا زمان حل شدن نمایش داده نمی‌شود.</p>
      </Card>
      <Card>
        <CardTitle>ترمینال حادثه</CardTitle>
        <div className="mt-4">
          <StartScenarioLab
            scenarioId={day.scenario.id}
            hints={
              track.slug === "devops-sre" && day.dayNumber === 1
                ? [
                    { level: 1, textFa: "اول uptime و بعد ps aux --sort=-%cpu | head را بزنید." },
                    { level: 2, textFa: "فرآیند بالای فهرست با CPU بالا را پیدا کنید. در این سناریو اغلب yes است." },
                    { level: 3, textFa: "kill PID را بزنید؛ PID را از ستون ps بردارید. بعد اعتبارسنجی کنید." },
                  ]
                : []
            }
          />
        </div>
      </Card>
    </div>
  );
}
