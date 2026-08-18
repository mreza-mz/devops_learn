import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";

export default async function AdminLabsPage() {
  await requireAdmin();
  const labs = await prisma.lab.findMany({
    include: { user: true, commands: { take: 5, orderBy: { createdAt: "desc" } }, validations: { take: 3, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">تلاش‌های آزمایشگاه</h1>
      {labs.map((lab) => (
        <Card key={lab.id}>
          <CardTitle>
            {lab.user.username} · {lab.status}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{lab.id}</p>
          <ul className="mt-2 text-sm">
            {lab.commands.map((command) => (
              <li key={command.id} dir="ltr" className="font-mono">
                {command.command}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
