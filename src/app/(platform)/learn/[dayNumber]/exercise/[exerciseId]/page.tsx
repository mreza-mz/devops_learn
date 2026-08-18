import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { SafeMarkdown } from "@/components/safe-markdown";
import { StartLab } from "@/features/learn/start-lab";
import type { Hint } from "@/types/domain";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ dayNumber: string; exerciseId: string }>;
}) {
  await requireUser();
  const { dayNumber, exerciseId } = await params;
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) {
    notFound();
  }
  const hints = (exercise.hintsJson as Hint[]) ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <p className="text-sm text-muted-foreground">روز {dayNumber}</p>
        <CardTitle>{exercise.titleFa}</CardTitle>
        <div className="mt-4">
          <SafeMarkdown content={exercise.instructionsMd} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">قوانین اعتبارسنجی مخفی هستند. راهنمایی نمره عملی را کم می‌کند.</p>
      </Card>
      <Card>
        <CardTitle>ترمینال آزمایشگاه</CardTitle>
        <div className="mt-4">
          <StartLab exerciseId={exercise.id} hints={hints} />
        </div>
      </Card>
    </div>
  );
}
