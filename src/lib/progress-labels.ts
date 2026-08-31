export type ProgressStatusKey = "IN_PROGRESS" | "PASSED" | "EXCELLENT" | "FAILED";

const STATUS_FA: Record<ProgressStatusKey, string> = {
  IN_PROGRESS: "در حال انجام",
  PASSED: "قبول",
  EXCELLENT: "عالی",
  FAILED: "مردود",
};

export function progressStatusFa(status: string | null | undefined, locked = false): string {
  if (locked) return "قفل";
  if (!status) return "شروع نشده";
  return STATUS_FA[status as ProgressStatusKey] ?? status;
}

export function progressBadgeTone(
  status: string | null | undefined,
  locked = false,
): "muted" | "success" | "danger" | "primary" | "accent" {
  if (locked) return "muted";
  if (status === "FAILED") return "danger";
  if (status === "EXCELLENT") return "accent";
  if (status === "PASSED") return "success";
  if (status === "IN_PROGRESS") return "primary";
  return "muted";
}
