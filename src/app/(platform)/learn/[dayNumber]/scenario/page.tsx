import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { learningService } from "@/services/learning/daily-learning-service";
import { Card, CardTitle } from "@/components/ui/card";
import { SafeMarkdown } from "@/components/safe-markdown";
import { StartScenarioLab } from "@/features/learn/start-scenario";

export default async function ScenarioPage({ params }: { params: Promise<{ dayNumber: string }> }) {
  await requireUser();
  const { dayNumber } = await params;
  const day = await learningService.getDay(Number(dayNumber));
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
          <StartScenarioLab scenarioId={day.scenario.id} />
        </div>
      </Card>
    </div>
  );
}
