import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toPercent } from "@/lib/utils";

export default async function ProgressPage() {
  const user = await requireUser();
  const rows = await prisma.progress.findMany({
    where: { userId: user.id },
    include: { dailyLesson: true },
    orderBy: { updatedAt: "desc" },
  });
  const skills = await prisma.userSkill.findMany({
    where: { userId: user.id },
    include: { topic: true },
    orderBy: { scoreAvg: "asc" },
  });
  const exams = await prisma.examAttempt.findMany({
    where: { userId: user.id },
    include: { exam: true },
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">پیشرفت</h1>
      <Card>
        <CardTitle>تاریخچه روزها</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-muted-foreground">
                <th className="p-2">روز</th>
                <th className="p-2">نمره</th>
                <th className="p-2">بهترین</th>
                <th className="p-2">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-2">{row.dailyLesson.dayNumber}</td>
                  <td className="p-2">{Math.round(row.latestScore)}</td>
                  <td className="p-2">{Math.round(row.bestScore)}</td>
                  <td className="p-2">
                    <Badge tone={row.status === "FAILED" ? "danger" : "success"}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <CardTitle>مهارت موضوع‌ها</CardTitle>
        <ul className="mt-3 space-y-2">
          {skills.map((skill) => (
            <li key={skill.id} className="flex justify-between text-sm">
              <span>{skill.topic.titleFa}</span>
              <span>
                {toPercent(skill.scoreAvg)}٪ {skill.isWeak ? "· ضعیف" : ""}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <CardTitle>تاریخچه آزمون</CardTitle>
        <ul className="mt-3 space-y-2 text-sm">
          {exams.map((exam) => (
            <li key={exam.id}>
              {exam.exam.titleFa}: {Math.round(exam.score)} — {exam.status}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
