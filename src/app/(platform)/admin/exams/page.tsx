import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";

export default async function AdminExamsPage() {
  await requireAdmin();
  const exams = await prisma.exam.findMany({ include: { questions: true, dailyLesson: true } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">آزمون‌ها و سؤال‌ها</h1>
      {exams.map((exam) => (
        <Card key={exam.id}>
          <CardTitle>{exam.titleFa}</CardTitle>
          <p className="text-sm text-muted-foreground">
            روز {exam.dailyLesson?.dayNumber ?? "-"} · {exam.questions.length} سؤال
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {exam.questions.map((question) => (
              <li key={question.id}>
                {question.promptFa} — پاسخ: {question.correctAnswer}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
