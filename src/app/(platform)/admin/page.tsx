import Link from "next/link";
import { requireAdmin } from "@/server/auth/guards";
import { Card, CardTitle } from "@/components/ui/card";

const items = [
  ["درس‌ها", "/admin/lessons"],
  ["موضوعات", "/admin/topics"],
  ["تمرین‌ها", "/admin/exercises"],
  ["سناریوها", "/admin/scenarios"],
  ["آزمون‌ها", "/admin/exams"],
  ["کاربران", "/admin/users"],
  ["آزمایشگاه‌ها", "/admin/labs"],
  ["محتوای AI", "/admin/ai"],
  ["پیکربندی", "/admin/settings"],
] as const;

export default async function AdminHome() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">پنل مدیریت</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(([label, href]) => (
          <Link key={href} href={href}>
            <Card>
              <CardTitle>{label}</CardTitle>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
