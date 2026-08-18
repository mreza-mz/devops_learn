import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { upsertTopicAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function AdminTopicsPage() {
  await requireAdmin();
  const topics = await prisma.topic.findMany({ include: { phase: true }, orderBy: [{ phaseId: "asc" }, { order: "asc" }] });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">موضوعات</h1>
      {topics.map((topic) => (
        <Card key={topic.id}>
          <CardTitle>
            {topic.titleFa} <span className="text-sm font-normal text-muted-foreground">{topic.phase.titleFa}</span>
          </CardTitle>
          <form action={upsertTopicAction} className="mt-3 grid gap-2">
            <input type="hidden" name="id" value={topic.id} />
            <input name="titleFa" defaultValue={topic.titleFa} className="rounded border bg-background p-2" />
            <textarea name="descriptionFa" defaultValue={topic.descriptionFa} className="rounded border bg-background p-2" />
            <input name="weaknessThreshold" type="number" step="0.05" defaultValue={topic.weaknessThreshold} className="rounded border bg-background p-2" />
            <Button type="submit">ذخیره</Button>
          </form>
        </Card>
      ))}
    </div>
  );
}
