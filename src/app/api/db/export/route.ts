import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth/guards";
import { exportDatabaseSnapshot } from "@/server/db/backup";
import { AppError, toUserError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUser();
    const { buffer, filename } = await exportDatabaseSnapshot();
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const mapped = toUserError(error);
    return NextResponse.json(
      { error: mapped.message },
      { status: error instanceof AppError ? error.status : mapped.status },
    );
  }
}
