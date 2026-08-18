import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({ include: { profile: true, progress: true } });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">پیشرفت کاربران</h1>
      {users.map((user) => (
        <Card key={user.id}>
          <CardTitle>
            {user.username} · {user.role}
          </CardTitle>
          <p className="text-sm">روز {user.profile?.currentDayNumber} · XP {user.profile?.xp} · streak {user.profile?.streak}</p>
          <p className="text-sm text-muted-foreground">{user.progress.length} روز ثبت‌شده</p>
        </Card>
      ))}
    </div>
  );
}
