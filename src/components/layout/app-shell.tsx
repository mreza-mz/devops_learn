import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SessionUser } from "@/types/domain";
import { TRACK_META, TRACK_SLUGS, type TrackSlug, isTrackSlug } from "@/config/tracks";

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

export function AppShell({
  user,
  trackSlug,
  children,
}: {
  user: SessionUser;
  trackSlug?: string | null;
  children: React.ReactNode;
}) {
  const slug = trackSlug && isTrackSlug(trackSlug) ? (trackSlug as TrackSlug) : null;
  const meta = slug ? TRACK_META[slug] : null;
  const brand = meta?.brandFa ?? "DevOps Learn";
  const subtitle = meta?.titleFa ?? "انتخاب مسیر یادگیری";
  const links = slug
    ? navLinks(slug)
    : [
        { href: "/tracks", label: "مسیرها" },
        { href: "/settings", label: "تنظیمات" },
      ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="p-6">
          <p className="text-xs opacity-70">آموزش محلی</p>
          <h1 className="text-xl font-bold">{brand}</h1>
          <p className="mt-1 text-xs opacity-70">{subtitle}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">
              {link.label}
            </Link>
          ))}
          {user.role === "ADMIN" ? (
            <Link href="/admin" className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">
              مدیریت
            </Link>
          ) : null}
        </nav>
        <form action={logoutAction} className="p-4">
          <button type="submit" className="text-sm opacity-80 hover:opacity-100">
            خروج
          </button>
        </form>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 md:px-8">
          <div className="md:hidden">
            <Link href={slug ? `/t/${slug}/dashboard` : "/tracks"} className="font-semibold">
              {brand}
            </Link>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="ms-auto flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user.username} ({user.role === "ADMIN" ? "ادمین" : "یادگیر"})
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
