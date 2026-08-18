import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none ring-ring focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
