import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { isAiConfigured } from "@/config/env";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const settings = await prisma.settings.findUnique({ where: { id: "global" } });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">تنظیمات</h1>
      <Card>
        <CardTitle>حساب محلی</CardTitle>
        <p className="mt-2 text-sm">نام کاربری: {user.username}</p>
        <p className="text-sm">نقش: {user.role === "ADMIN" ? "ادمین" : "یادگیر"}</p>
        <p className="text-sm">روز جاری: {profile?.currentDayNumber}</p>
      </Card>
      <Card>
        <CardTitle>آستانه‌های یادگیری</CardTitle>
        <ul className="mt-3 space-y-1 text-sm">
          <li>حد قبولی: {settings?.passingScore}</li>
          <li>حد عالی: {settings?.excellentScore}</li>
          <li>آستانه ضعف موضوع: {Math.round((settings?.weaknessThreshold ?? 0.6) * 100)}٪</li>
          <li>جریمه هر راهنمایی: {settings?.hintPenalty}</li>
        </ul>
      </Card>
      <Card>
        <CardTitle>هوش مصنوعی</CardTitle>
        <p className="mt-2 text-sm">
          {isAiConfigured()
            ? "AvalAI پیکربندی شده و برای تولید/نمره کیفی استفاده می‌شود."
            : "کلید AvalAI تنظیم نشده. برنامه آفلاین با نمره‌دهی قطعی کار می‌کند."}
        </p>
      </Card>
    </div>
  );
}
