import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { TRACK_SLUGS } from "@/config/tracks";

export default async function LegacyExamRedirect({ params }: { params: Promise<{ dayNumber: string }> }) {
  await requireUser();
  const { dayNumber } = await params;
  redirect(`/t/${TRACK_SLUGS.DEVOPS_SRE}/learn/${dayNumber}/exam`);
}
