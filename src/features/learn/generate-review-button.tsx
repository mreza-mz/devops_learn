"use client";

import { useTransition, useState } from "react";
import { generateReviewAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function GenerateReviewButton({ topicId }: { topicId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div>
      <Button
        size="sm"
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await generateReviewAction(topicId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          })
        }
      >
        تولید تمرین جدید
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
