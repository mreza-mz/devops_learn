import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionUser } from "@/server/auth/session";
import { AppShell } from "@/components/layout/app-shell";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return <AppShell user={user}>{children}</AppShell>;
}
