import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { setContentStatusAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function AdminScenariosPage() {
  await requireAdmin();
  const scenarios = await prisma.productionScenario.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">سناریوها</h1>
      {scenarios.map((scenario) => (
        <Card key={scenario.id} className="space-y-2">
          <CardTitle>{scenario.titleFa}</CardTitle>
          <p className="text-sm">{scenario.incidentMd}</p>
          <p className="text-xs text-muted-foreground">علت مخفی (فقط ادمین): {scenario.hiddenRootCause}</p>
          <form
            action={async () => {
              "use server";
              await setContentStatusAction("scenario", scenario.id, "APPROVED");
            }}
          >
            <Button type="submit" variant="outline">
              تأیید
            </Button>
          </form>
        </Card>
      ))}
    </div>
  );
}
