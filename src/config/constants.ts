export const ROLES = {
  ADMIN: "ADMIN",
  LEARNER: "LEARNER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const CONTENT_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const ATTEMPT_STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  FAILED: "FAILED",
  PASSED: "PASSED",
  EXCELLENT: "EXCELLENT",
} as const;

export const LAB_STATUS = {
  CREATING: "CREATING",
  RUNNING: "RUNNING",
  STOPPED: "STOPPED",
  EXPIRED: "EXPIRED",
  DESTROYED: "DESTROYED",
  ERROR: "ERROR",
} as const;

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
  SHORT_ANSWER: "SHORT_ANSWER",
  COMMAND: "COMMAND",
  TROUBLESHOOTING: "TROUBLESHOOTING",
  SCENARIO: "SCENARIO",
} as const;

export const SESSION_COOKIE = "devops_learn_session";
export const DEFAULT_PASSING_SCORE = 70;
export const DEFAULT_EXCELLENT_SCORE = 90;
export const DEFAULT_WEAKNESS_THRESHOLD = 0.6;
export const DEFAULT_HINT_PENALTY = 5;

export const SCORE_WEIGHTS = {
  theory: 20,
  practical: 30,
  scenario: 20,
  exam: 30,
} as const;

export const PUBLIC_PATHS = ["/login", "/api/health"];
