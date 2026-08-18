"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="username">نام کاربری</label>
        <Input id="username" name="username" autoComplete="username" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="password">رمز عبور</label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "در حال ورود..." : "ورود"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">پلتفرم محلی</p>
          <CardTitle className="mt-1 text-2xl">یادگیری DevOps و SRE</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">با حساب محلی وارد شوید. اینترنت فقط برای AvalAI لازم است.</p>
        </div>
        <LoginForm />
        <p className="text-xs text-muted-foreground">حساب‌های پیش‌فرض: admin / admin123 و learner / learner123</p>
      </Card>
    </main>
  );
}
