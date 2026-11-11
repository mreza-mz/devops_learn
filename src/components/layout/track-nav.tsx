"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TRACK_META, TRACK_SLUGS, type TrackSlug, isTrackSlug } from "@/config/tracks";
import { cn } from "@/lib/utils";

function navLinks(trackSlug: TrackSlug) {
  const common = [
    { href: `/t/${trackSlug}/dashboard`, label: "داشبورد" },
    { href: `/t/${trackSlug}/learn`, label: "درس‌ها" },
    { href: `/t/${trackSlug}/progress`, label: "پیشرفت" },
  ];

  if (trackSlug === TRACK_SLUGS.BACKEND_GO) {
    return [
      ...common,
      { href: `/t/${trackSlug}/interview`, label: "مصاحبه آزمایشی" },
      { href: `/t/${trackSlug}/reviews`, label: "مرور" },
      { href: "/tracks", label: "تعویض مسیر" },
      { href: "/settings", label: "تنظیمات" },
    ];
  }

  return [
    ...common,
    { href: "/projects", label: "پروژه‌ها" },
    { href: `/t/${trackSlug}/reviews`, label: "مرور" },
    { href: "/tracks", label: "تعویض مسیر" },
    { href: "/settings", label: "تنظیمات" },
  ];
}

const fallbackLinks = [
  { href: "/tracks", label: "مسیرها" },
  { href: "/settings", label: "تنظیمات" },
];

function useCurrentTrack(activeTrackSlug: string | null): TrackSlug | null {
  const pathname = usePathname();
  const [lastVisited, setLastVisited] = useState<TrackSlug | null>(null);
  const fromPath = pathname.match(/^\/t\/([^/]+)/)?.[1] ?? null;
  if (fromPath && isTrackSlug(fromPath)) {
    if (fromPath !== lastVisited) setLastVisited(fromPath);
    return fromPath;
  }
  if (lastVisited) return lastVisited;
  return activeTrackSlug && isTrackSlug(activeTrackSlug) ? activeTrackSlug : null;
}

export function TrackSidebar({ activeTrackSlug, isAdmin }: { activeTrackSlug: string | null; isAdmin: boolean }) {
  const pathname = usePathname();
  const slug = useCurrentTrack(activeTrackSlug);
  const meta = slug ? TRACK_META[slug] : null;
  const links = slug ? navLinks(slug) : fallbackLinks;

  return (
    <>
      <div className="p-6">
        <p className="text-xs opacity-70">آموزش محلی</p>
        <h1 className="text-xl font-bold">{meta?.brandFa ?? "DevOps Learn"}</h1>
        <p className="mt-1 text-xs opacity-70">{meta?.titleFa ?? "انتخاب مسیر یادگیری"}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm hover:bg-white/10",
              pathname.startsWith(link.href) && "bg-white/10 font-medium",
            )}
          >
            {link.label}
          </Link>
        ))}
        {isAdmin ? (
          <Link href="/admin" className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">
            مدیریت
          </Link>
        ) : null}
      </nav>
    </>
  );
}

export function TrackMobileBrand({ activeTrackSlug }: { activeTrackSlug: string | null }) {
  const slug = useCurrentTrack(activeTrackSlug);
  const meta = slug ? TRACK_META[slug] : null;
  return (
    <div className="md:hidden">
      <Link href={slug ? `/t/${slug}/dashboard` : "/tracks"} className="font-semibold">
        {meta?.brandFa ?? "DevOps Learn"}
      </Link>
      <p className="text-xs text-muted-foreground">{meta?.titleFa ?? "انتخاب مسیر یادگیری"}</p>
    </div>
  );
}
