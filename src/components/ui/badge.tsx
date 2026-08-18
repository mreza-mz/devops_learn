import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "muted" | "success" | "danger" | "primary" | "accent" }) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success",
    danger: "bg-danger/15 text-danger",
    primary: "bg-primary/15 text-primary",
    accent: "bg-accent/15 text-accent",
  };
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)} {...props} />;
}
