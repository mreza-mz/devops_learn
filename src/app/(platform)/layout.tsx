import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionUser } from "@/server/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { trackService } from "@/services/tracks/track-service";
import { isTrackSlug } from "@/config/tracks";

export const dynamic = "force-dynamic";

function trackSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/t\/([^/]+)/);
  const slug = match?.[1] ?? null;
  return slug && isTrackSlug(slug) ? slug : null;
}

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  let trackSlug = trackSlugFromPath(pathname);

  if (!trackSlug) {
    try {
      const active = await trackService.getOrCreateActiveTrack(user.id);
      trackSlug = active.slug;
    } catch {
      trackSlug = null;
    }
  } else {
    // Keep DB active track aligned with the URL the user is viewing.
    try {
      await trackService.setActiveTrack(user.id, trackSlug);
    } catch {
      // ignore sync errors; URL still drives the shell
    }
  }

  return (
    <AppShell user={user} trackSlug={trackSlug}>
      {children}
    </AppShell>
  );
}
