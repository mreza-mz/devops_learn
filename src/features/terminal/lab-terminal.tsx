"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resetLabAction, stopLabAction, validateExerciseAction, validateScenarioAction } from "@/app/actions";
import type { Hint } from "@/types/domain";

type Props = {
  mode: "exercise" | "scenario";
  labId: string;
  token: string;
  gatewayUrl: string;
  remainingSec: number;
  hints: Hint[];
};

export function LabTerminal({ mode, labId, token, gatewayUrl, remainingSec, hints }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [status, setStatus] = useState("در حال اتصال");
  const [remaining, setRemaining] = useState(remainingSec);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const term = new Terminal({
      cursorBlink: true,
      disableStdin: false,
      convertEol: true,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 14,
      allowProposedApi: true,
      theme: { background: "#0b1014", foreground: "#e8eef2" },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(host);
    requestAnimationFrame(() => {
      fit.fit();
      term.focus();
    });
    termRef.current = term;

    const wsUrl = `${gatewayUrl.replace(/\/$/, "")}/pty`;
    const socket = new WebSocket(wsUrl);
    socket.binaryType = "arraybuffer";
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "auth",
          token,
          cols: term.cols,
          rows: term.rows,
        }),
      );
      setStatus("متصل");
      term.focus();
    };
    socket.onmessage = (event) => {
      if (typeof event.data === "string") {
        term.write(event.data);
        return;
      }
      term.write(new Uint8Array(event.data as ArrayBuffer));
    };
    socket.onclose = () => {
      setStatus("قطع شد");
      term.writeln("\r\n[lab] connection closed");
    };
    socket.onerror = () => {
      setStatus("خطای اتصال");
      term.writeln("\r\n[lab] websocket error — is the terminal gateway running on port 3001?");
    };
    const dataDisposable = term.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    });
    const onResize = () => {
      fit.fit();
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      }
    };
    const onPointerDown = () => term.focus();
    host.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);

    return () => {
      dataDisposable.dispose();
      host.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      socket.close();
      term.dispose();
    };
  }, [gatewayUrl, token]);

  function revealHint() {
    setHintsUsed((value) => Math.min(hints.length, value + 1));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={status === "متصل" ? "success" : "muted"}>{status}</Badge>
        <Badge>
          زمان باقی‌مانده: {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() => {
            termRef.current?.clear();
            termRef.current?.focus();
          }}
        >
          پاک کردن ترمینال
        </Button>
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={() =>
            start(async () => {
              await resetLabAction(labId);
              window.location.reload();
            })
          }
        >
          بازنشانی لب
        </Button>
        <Button
          size="sm"
          variant="danger"
          type="button"
          onClick={() =>
            start(async () => {
              await stopLabAction(labId);
              setStatus("متوقف");
            })
          }
        >
          توقف لب
        </Button>
        <Button
          size="sm"
          disabled={pending}
          type="button"
          onClick={() =>
            start(async () => {
              const result =
                mode === "exercise"
                  ? await validateExerciseAction(labId, hintsUsed)
                  : await validateScenarioAction(labId);
              if (!result.ok) {
                setFeedback(result.error);
                return;
              }
              setFeedback(
                "feedbackFa" in result.data && result.data.feedbackFa
                  ? result.data.feedbackFa
                  : result.data.status === "PASSED" || result.data.status === "EXCELLENT"
                    ? "اعتبارسنجی موفق بود."
                    : "هنوز کامل نیست.",
              );
            })
          }
        >
          اعتبارسنجی
        </Button>
      </div>
      <div
        ref={hostRef}
        className="lab-terminal h-[420px] overflow-hidden rounded-xl border bg-black p-2"
        dir="ltr"
        tabIndex={0}
        onFocus={() => termRef.current?.focus()}
      />
      <p className="text-xs text-muted-foreground">روی ترمینال کلیک کنید و بعد تایپ کنید. اگر وضعیت «قطع شد» است، Docker Desktop و `npm run dev` را بررسی کنید.</p>
      <div className="space-y-2">
        <Button size="sm" variant="ghost" type="button" onClick={revealHint} disabled={hintsUsed >= hints.length}>
          نمایش راهنمایی بعدی (کاهش نمره)
        </Button>
        {hints.slice(0, hintsUsed).map((hint) => (
          <p key={hint.level} className="text-sm">
            راهنمایی {hint.level}: {hint.textFa}
          </p>
        ))}
      </div>
      {feedback ? <p className="rounded-lg bg-muted p-3 text-sm">{feedback}</p> : null}
    </div>
  );
}
