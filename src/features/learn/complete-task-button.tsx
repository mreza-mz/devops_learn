"use client";

import { useTransition } from "react";
import { completeProjectTaskAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CompleteTaskButton({ taskId }: { taskId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      size="sm"
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await completeProjectTaskAction(taskId);
          router.refresh();
        })
      }
    >
      ثبت انجام
    </Button>
  );
}
