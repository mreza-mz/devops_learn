import Link from "next/link";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { learningService } from "@/services/learning/daily-learning-service";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toPercent } from "@/lib/utils";
import { progressBadgeTone, progressStatusFa } from "@/lib/progress-labels";

export default async function ProgressPage() {
  const user = await requireUser();
  const curriculum = await learningService.listDaysWithProgress(user.id);
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
        <p className="mt-1 text-sm text-muted-foreground">برای مرور دوباره روی هر درس کلیک کنید.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-muted-foreground">
                <th className="p-2">روز</th>
                <th className="p-2">عنوان</th>
                <th className="p-2">نمره</th>
                <th className="p-2">بهترین</th>
                <th className="p-2">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {curriculum.days.map((day) => {
                const locked = !day.unlocked;
                const score = day.status ? Math.round(day.latestScore) : "—";
                const best = day.status ? Math.round(day.bestScore) : "—";

                return (
                  <tr
                    key={day.id}
                    className={`border-t ${locked ? "opacity-60" : "hover:bg-muted/40"} ${day.isCurrent ? "bg-primary/5" : ""}`}
                  >
                    <td className="p-2 whitespace-nowrap">
                      {locked ? (
                        `روز ${day.dayNumber}`
                      ) : (
                        <Link href={`/learn/${day.dayNumber}`} className="text-primary hover:underline">
                          روز {day.dayNumber}
                        </Link>
                      )}
                    </td>
                    <td className="p-2">
                      {locked ? (
                        <>
                          <div className="font-medium">{day.titleFa}</div>
                          <div className="text-xs text-muted-foreground">{day.phaseTitleFa}</div>
                        </>
                      ) : (
                        <Link href={`/learn/${day.dayNumber}`} className="hover:underline">
                          <div className="font-medium">{day.titleFa}</div>
                          <div className="text-xs text-muted-foreground">{day.phaseTitleFa}</div>
                        </Link>
                      )}
                    </td>
                    <td className="p-2">{score}</td>
                    <td className="p-2">{best}</td>
                    <td className="p-2">
                      <Badge tone={progressBadgeTone(day.status, locked)}>
                        {progressStatusFa(day.status, locked)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
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
              {exam.exam.titleFa}: {Math.round(exam.score)} — {progressStatusFa(exam.status)}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
