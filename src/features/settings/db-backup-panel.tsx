"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function DbBackupPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onExport() {
    setBusy("export");
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/db/export");
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "خروجی گرفتن ناموفق بود.");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match?.[1] ?? `devops-learn-backup-${Date.now()}.db`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("فایل بکاپ دانلود شد. آن را جایی امن نگه دارید.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خروجی گرفتن ناموفق بود.");
    } finally {
      setBusy(null);
    }
  }

  async function onImport(file: File) {
    const confirmed = window.confirm(
      "با وارد کردن بکاپ، دیتابیس فعلی جایگزین می‌شود (یک نسخهٔ پشتیبان خودکار کنار فایل فعلی ساخته می‌شود). ادامه می‌دهید؟",
    );
    if (!confirmed) {
      return;
    }

    setBusy("import");
    setMessage(null);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/db/import", { method: "POST", body });
      const payload = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; error?: string }
        | null;
      if (!res.ok) {
        throw new Error(payload?.error ?? "وارد کردن بکاپ ناموفق بود.");
      }
      setMessage(payload?.message ?? "دیتابیس وارد شد.");
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "وارد کردن بکاپ ناموفق بود.");
    } finally {
      setBusy(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        قبل از تعویض سیستم یا نصب دوباره، از دیتابیس خروجی بگیرید. بعد از انتقال، همان فایل را وارد کنید تا
        پیشرفت درس‌ها، نمره‌ها و حساب‌ها برگردد.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={onExport} disabled={busy !== null}>
          {busy === "export" ? "در حال خروجی…" : "خروجی دیتابیس (.db)"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy !== null}
          onClick={() => inputRef.current?.click()}
        >
          {busy === "import" ? "در حال وارد کردن…" : "وارد کردن بکاپ"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".db,application/octet-stream"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void onImport(file);
            }
          }}
        />
      </div>
      {message ? <p className="text-sm text-success">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
