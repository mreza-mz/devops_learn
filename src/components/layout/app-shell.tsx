import { logoutAction } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { TrackMobileBrand, TrackSidebar } from "@/components/layout/track-nav";
import type { SessionUser } from "@/types/domain";

export function AppShell({
  user,
  trackSlug,
  children,
}: {
  user: SessionUser;
  trackSlug?: string | null;
  children: React.ReactNode;
}) {
  const activeTrackSlug = trackSlug ?? null;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <TrackSidebar activeTrackSlug={activeTrackSlug} isAdmin={user.role === "ADMIN"} />
        <form action={logoutAction} className="p-4">
          <button type="submit" className="text-sm opacity-80 hover:opacity-100">
            خروج
          </button>
        </form>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 md:px-8">
          <TrackMobileBrand activeTrackSlug={activeTrackSlug} />
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
