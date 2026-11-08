import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { TRACK_SLUGS } from "@/config/tracks";

export default async function LegacyExerciseRedirect({
  params,
}: {
  params: Promise<{ dayNumber: string; exerciseId: string }>;
}) {
  await requireUser();
  const { dayNumber, exerciseId } = await params;
  redirect(`/t/${TRACK_SLUGS.DEVOPS_SRE}/learn/${dayNumber}/exercise/${exerciseId}`);
}
