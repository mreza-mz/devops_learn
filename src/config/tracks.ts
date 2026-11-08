export const TRACK_SLUGS = {
  DEVOPS_SRE: "devops-sre",
  BACKEND_GO: "backend-go",
} as const;

export type TrackSlug = (typeof TRACK_SLUGS)[keyof typeof TRACK_SLUGS];

export const TRACK_META: Record<
  TrackSlug,
  { titleFa: string; titleEn: string; descriptionFa: string; order: number; brandFa: string }
> = {
  [TRACK_SLUGS.DEVOPS_SRE]: {
    titleFa: "DevOps و SRE",
    titleEn: "DevOps & SRE",
    descriptionFa: "مسیر ساختاریافته از لینوکس تا پلتفرم و SRE.",
    order: 1,
    brandFa: "DevOps → SRE",
  },
  [TRACK_SLUGS.BACKEND_GO]: {
    titleFa: "Backend و Golang",
    titleEn: "Backend Engineering & Go",
    descriptionFa: "آمادگی مصاحبه Mid/Senior با تمرکز روی Go، الگوریتم، دیتابیس و طراحی سیستم.",
    order: 2,
    brandFa: "Backend → Go",
  },
};

export function isTrackSlug(value: string): value is TrackSlug {
  return value === TRACK_SLUGS.DEVOPS_SRE || value === TRACK_SLUGS.BACKEND_GO;
}

export function trackLearnHref(trackSlug: string, dayNumber: number) {
  return `/t/${trackSlug}/learn/${dayNumber}`;
}

export function trackDashboardHref(trackSlug: string) {
  return `/t/${trackSlug}/dashboard`;
}
