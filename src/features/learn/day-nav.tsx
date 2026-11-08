import Link from "next/link";
import { trackLearnHref } from "@/config/tracks";

type DayNavProps = {
  trackSlug: string;
  dayNumber: number;
  prevDayNumber: number | null;
  nextDayNumber: number | null;
  nextUnlocked: boolean;
};

export function DayNav({ trackSlug, dayNumber, prevDayNumber, nextDayNumber, nextUnlocked }: DayNavProps) {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 text-sm">
      {prevDayNumber != null ? (
        <Link href={trackLearnHref(trackSlug, prevDayNumber)} className="text-primary hover:underline">
          روز قبلی ({prevDayNumber})
        </Link>
      ) : (
        <span className="text-muted-foreground">اولین درس</span>
      )}
      <Link href={`/t/${trackSlug}/learn`} className="text-muted-foreground hover:text-foreground hover:underline">
        همه درس‌ها · روز {dayNumber}
      </Link>
      {nextDayNumber != null && nextUnlocked ? (
        <Link href={trackLearnHref(trackSlug, nextDayNumber)} className="text-primary hover:underline">
          روز بعدی ({nextDayNumber})
        </Link>
      ) : nextDayNumber != null ? (
        <span className="text-muted-foreground">روز بعد هنوز قفل است</span>
      ) : (
        <span className="text-muted-foreground">آخرین درس</span>
      )}
    </nav>
  );
}
