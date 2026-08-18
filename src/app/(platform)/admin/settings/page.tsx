import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { updateSettingsAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await prisma.settings.findUniqueOrThrow({ where: { id: "global" } });
  async function save(formData: FormData) {
    "use server";
    await updateSettingsAction({
      passingScore: Number(formData.get("passingScore")),
      excellentScore: Number(formData.get("excellentScore")),
      weaknessThreshold: Number(formData.get("weaknessThreshold")),
      hintPenalty: Number(formData.get("hintPenalty")),
      aiEnabled: formData.get("aiEnabled") === "on",
      requireAiApproval: formData.get("requireAiApproval") === "on",
    });
  }
  return (
    <Card>
      <CardTitle>پیکربندی سراسری</CardTitle>
      <form action={save} className="mt-4 grid max-w-md gap-3">
        <label>
          حد قبولی
          <input name="passingScore" type="number" defaultValue={settings.passingScore} className="mt-1 w-full rounded border bg-background p-2" />
        </label>
        <label>
          حد عالی
          <input name="excellentScore" type="number" defaultValue={settings.excellentScore} className="mt-1 w-full rounded border bg-background p-2" />
        </label>
        <label>
          آستانه ضعف (۰ تا ۱)
          <input name="weaknessThreshold" type="number" step="0.05" defaultValue={settings.weaknessThreshold} className="mt-1 w-full rounded border bg-background p-2" />
        </label>
        <label>
          جریمه راهنمایی
          <input name="hintPenalty" type="number" defaultValue={settings.hintPenalty} className="mt-1 w-full rounded border bg-background p-2" />
        </label>
        <label className="flex items-center gap-2">
          <input name="aiEnabled" type="checkbox" defaultChecked={settings.aiEnabled} />
          AI فعال
        </label>
        <label className="flex items-center gap-2">
          <input name="requireAiApproval" type="checkbox" defaultChecked={settings.requireAiApproval} />
          تأیید ادمین برای محتوای AI
        </label>
        <Button type="submit">ذخیره</Button>
      </form>
    </Card>
  );
}
