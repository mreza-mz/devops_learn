import Link from "next/link";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { learningService } from "@/services/learning/daily-learning-service";
import { trackService } from "@/services/tracks/track-service";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toPercent } from "@/lib/utils";
import { progressBadgeTone, progressStatusFa } from "@/lib/progress-labels";
import { trackLearnHref } from "@/config/tracks";

export default async function TrackProgressPage({ params }: { params: Promise<{ trackSlug: string }> }) {
  const user = await requireUser();
  const { trackSlug } = await params;
  const track = await trackService.setActiveTrack(user.id, trackSlug);
  const curriculum = await learningService.listDaysWithProgress(user.id, track.id);
  const skills = await prisma.userSkill.findMany({
    where: { userId: user.id, topic: { trackId: track.id } },
    include: { topic: true },
    orderBy: { scoreAvg: "asc" },
  });
  const exams = await prisma.examAttempt.findMany({
    where: { userId: user.id, exam: { dailyLesson: { trackId: track.id } } },
    include: { exam: true },
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">پیشرفت — {track.titleFa}</h1>
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
                        <Link href={trackLearnHref(track.slug, day.dayNumber)} className="text-primary hover:underline">
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
                        <Link href={trackLearnHref(track.slug, day.dayNumber)} className="hover:underline">
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>مهارت‌ها</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {skills.map((skill) => (
              <li key={skill.id} className="flex justify-between gap-2">
                <span>{skill.topic.titleFa}</span>
                <span>{toPercent(skill.scoreAvg)}%</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>آزمون‌های اخیر</CardTitle>
          <ul className="mt-3 space-y-2 text-sm">
            {exams.map((exam) => (
              <li key={exam.id} className="flex justify-between gap-2">
                <span>{exam.exam.titleFa}</span>
                <span>{Math.round(exam.score)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
