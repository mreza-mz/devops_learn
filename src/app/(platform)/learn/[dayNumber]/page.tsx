import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { TRACK_SLUGS, trackLearnHref } from "@/config/tracks";

export default async function LegacyDayRedirect({ params }: { params: Promise<{ dayNumber: string }> }) {
  await requireUser();
  const { dayNumber } = await params;
  redirect(trackLearnHref(TRACK_SLUGS.DEVOPS_SRE, Number(dayNumber)));
}
