import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { SafeMarkdown } from "@/components/safe-markdown";
import { StartLab } from "@/features/learn/start-lab";
import type { Hint } from "@/types/domain";

export default async function ReviewExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  await requireUser();
  const { exerciseId } = await params;
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) {
    notFound();
  }
  const hints = (exercise.hintsJson as Hint[]) ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <Link className="text-primary" href="/reviews">
          بازگشت به صف مرور
        </Link>
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm text-muted-foreground">تمرین مرور</p>
          <CardTitle>{exercise.titleFa}</CardTitle>
          <div className="mt-4">
            <SafeMarkdown content={exercise.instructionsMd} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            هدف را در ترمینال آزمایشگاه خودتان پیدا کنید و اجرا کنید. دستور آماده در متن تمرین نیست؛ اگر گیر
            کردید از «نمایش راهنمایی بعدی» استفاده کنید (هر راهنمایی نمره را کم می‌کند).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">قوانین اعتبارسنجی مخفی هستند.</p>
        </Card>
        <Card>
          <CardTitle>ترمینال آزمایشگاه</CardTitle>
          <div className="mt-4">
            <StartLab exerciseId={exercise.id} hints={hints} />
          </div>
        </Card>
      </div>
    </div>
  );
}
