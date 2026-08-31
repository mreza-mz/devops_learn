import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/guards";
import { importDatabaseSnapshot } from "@/server/db/backup";
import { AppError, toUserError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireUser();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "فایل بکاپ را انتخاب کنید." }, { status: 422 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importDatabaseSnapshot(buffer);

    return NextResponse.json({
      ok: true,
      message: "دیتابیس با موفقیت وارد شد. صفحه را یک‌بار رفرش کنید.",
      previousBackupPath: result.previousBackupPath,
    });
  } catch (error) {
    const mapped = toUserError(error);
    return NextResponse.json(
      { error: mapped.message },
      { status: error instanceof AppError ? error.status : mapped.status },
    );
  }
}
