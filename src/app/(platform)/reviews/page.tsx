import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { trackService } from "@/services/tracks/track-service";

export default async function ReviewsRedirectPage() {
  const user = await requireUser();
  const track = await trackService.getOrCreateActiveTrack(user.id);
  redirect(`/t/${track.slug}/reviews`);
}
