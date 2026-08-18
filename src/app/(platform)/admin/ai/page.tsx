import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setContentStatusAction } from "@/app/actions";

export default async function AdminAiPage() {
  await requireAdmin();
  const requests = await prisma.aIRequest.findMany({ include: { logs: true }, orderBy: { createdAt: "desc" }, take: 30 });
  const pending = await prisma.exercise.findMany({ where: { aiGenerated: true }, orderBy: { createdAt: "desc" }, take: 30 });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">محتوا و لاگ AI</h1>
      <Card>
        <CardTitle>در انتظار تأیید</CardTitle>
        {pending.map((item) => (
          <form
            key={item.id}
            className="mt-3 flex items-center justify-between gap-3"
            action={async () => {
              "use server";
              await setContentStatusAction("exercise", item.id, "APPROVED");
            }}
          >
            <span>
              {item.titleFa} · {item.status}
            </span>
            <Button type="submit" size="sm">
              تأیید
            </Button>
          </form>
        ))}
      </Card>
      {requests.map((request) => (
        <Card key={request.id}>
          <CardTitle>
            {request.purpose} · {request.success ? "موفق" : "ناموفق"}
          </CardTitle>
          <p className="text-sm">
            مدل {request.model} · {request.latencyMs}ms · توکن ورودی {request.inputTokens ?? "-"} / خروجی {request.outputTokens ?? "-"}
          </p>
        </Card>
      ))}
    </div>
  );
}
