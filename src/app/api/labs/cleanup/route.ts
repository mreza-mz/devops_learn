import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/guards";
import { toUserError } from "@/lib/errors";
import { consumeRateLimit } from "@/lib/rate-limit";
import { dockerSandboxService } from "@/server/docker/docker-sandbox-service";

export async function POST() {
  try {
    const user = await requireUser();
    if (!consumeRateLimit(`lab-cleanup:${user.id}`, 5, 60_000)) {
      return NextResponse.json({ error: "تعداد درخواست‌ها زیاد است." }, { status: 429 });
    }
    await dockerSandboxService.cleanupExpired();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const mapped = toUserError(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
