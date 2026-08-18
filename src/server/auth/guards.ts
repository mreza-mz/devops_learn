import { errors } from "@/lib/errors";
import { getSessionUser } from "@/server/auth/session";
import type { SessionUser } from "@/types/domain";

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw errors.unauthorized();
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw errors.forbidden();
  }
  return user;
}
