import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { upsertExerciseAction, setContentStatusAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function AdminExercisesPage() {
  await requireAdmin();
  const exercises = await prisma.exercise.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">تمرین‌ها</h1>
      {exercises.map((exercise) => (
        <Card key={exercise.id}>
          <CardTitle>{exercise.titleFa}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {exercise.status} {exercise.aiGenerated ? "· تولید AI" : ""}
          </p>
          <form action={upsertExerciseAction} className="mt-3 grid gap-2">
            <input type="hidden" name="id" value={exercise.id} />
            <input name="titleFa" defaultValue={exercise.titleFa} className="rounded border bg-background p-2" />
            <textarea name="instructionsMd" defaultValue={exercise.instructionsMd} rows={4} className="rounded border bg-background p-2" />
            <input name="difficulty" defaultValue={exercise.difficulty} className="rounded border bg-background p-2" />
            <input name="maxScore" type="number" defaultValue={exercise.maxScore} className="rounded border bg-background p-2" />
            <Button type="submit">ذخیره</Button>
          </form>
          <form
            action={async () => {
              "use server";
              await setContentStatusAction("exercise", exercise.id, "APPROVED");
            }}
            className="mt-2"
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
