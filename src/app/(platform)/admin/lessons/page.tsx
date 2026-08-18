import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { upsertLessonAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function AdminLessonsPage() {
  await requireAdmin();
  const lessons = await prisma.lesson.findMany({ include: { topic: true, dailyLesson: true }, orderBy: { updatedAt: "desc" }, take: 50 });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">درس‌ها</h1>
      {lessons.map((lesson) => (
        <Card key={lesson.id}>
          <CardTitle>{lesson.titleFa}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {lesson.topic.titleFa} · {lesson.status} {lesson.aiGenerated ? "· AI" : ""}
          </p>
          <form action={upsertLessonAction} className="mt-3 grid gap-2">
            <input type="hidden" name="id" value={lesson.id} />
            <input name="titleFa" defaultValue={lesson.titleFa} className="rounded border bg-background p-2" />
            <textarea name="objectiveFa" defaultValue={lesson.objectiveFa} className="rounded border bg-background p-2" />
            <textarea name="theoryMd" defaultValue={lesson.theoryMd} rows={4} className="rounded border bg-background p-2" />
            <textarea name="practicalMd" defaultValue={lesson.practicalMd} rows={3} className="rounded border bg-background p-2" />
            <textarea name="exampleMd" defaultValue={lesson.exampleMd} rows={3} className="rounded border bg-background p-2" />
            <select name="status" defaultValue={lesson.status} className="rounded border bg-background p-2">
              <option value="APPROVED">تأیید</option>
              <option value="PENDING_REVIEW">در انتظار</option>
              <option value="REJECTED">رد</option>
              <option value="DRAFT">پیش‌نویس</option>
            </select>
            <Button type="submit">ذخیره</Button>
          </form>
        </Card>
      ))}
    </div>
  );
}
