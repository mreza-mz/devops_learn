import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { trackService } from "@/services/tracks/track-service";
import { trackDashboardHref } from "@/config/tracks";

export default async function DashboardRedirectPage() {
  const user = await requireUser();
  const track = await trackService.getOrCreateActiveTrack(user.id);
  redirect(trackDashboardHref(track.slug));
}
