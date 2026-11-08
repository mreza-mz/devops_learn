import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { TRACK_SLUGS } from "@/config/tracks";
import { InterviewStartForm } from "@/features/interview/interview-start-form";
import { Card } from "@/components/ui/card";

export default async function InterviewLandingPage({
  params,
}: {
  params: Promise<{ trackSlug: string }>;
}) {
  await requireUser();
  const { trackSlug } = await params;
  if (trackSlug !== TRACK_SLUGS.BACKEND_GO) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">مصاحبه آزمایشی</h1>
        <p className="mt-2 text-muted-foreground">
          شبیه‌ساز سبک برای تمرین پاسخگویی شفاهی/نوشتاری با بازخورد فوری پس از هر سؤال.
        </p>
      </div>
      <InterviewStartForm trackSlug={trackSlug} />
      <Card className="p-5 text-sm text-muted-foreground">
        سؤالات از بانک ثابت انتخاب می‌شوند و پاسخ شما با همان سرویس هوش مصنوعی درس‌ها نمره‌دهی می‌شود. برای تمرین
        عمیق‌تر به روزهای ۴۲ تا ۴۵ مسیر بروید.
      </Card>
    </div>
  );
}
