import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SessionUser } from "@/types/domain";

const links = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/learn", label: "درس امروز" },
  { href: "/progress", label: "پیشرفت" },
  { href: "/projects", label: "پروژه‌ها" },
  { href: "/reviews", label: "مرور" },
  { href: "/settings", label: "تنظیمات" },
];

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="p-6">
          <p className="text-xs opacity-70">آموزش محلی</p>
          <h1 className="text-xl font-bold">DevOps → SRE</h1>
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
            <Link href="/dashboard" className="font-semibold">
              DevOps → SRE
            </Link>
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
