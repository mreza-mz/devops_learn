export type SessionUser = {
  id: string;
  username: string;
  role: "ADMIN" | "LEARNER";
};

export type DailyScoreParts = {
  theory: number;
  practical: number;
  scenario: number;
  exam: number;
};

export type ScoreClassification = "failed" | "passed" | "excellent";

export type ScoreThresholds = {
  passingScore: number;
  excellentScore: number;
};

export type LevelRequirements = {
  minExamAverage: number;
  minPracticalSuccessRate: number;
  minScenariosPassed: number;
  minProjectsCompleted: number;
  minStreak: number;
  weakTopicMax: number;
  previousLevelOrder: number;
};

export type ValidationCheck =
  | { type: "userExists"; name: string; shell?: string; group?: string }
  | { type: "fileExists"; path: string }
  | { type: "directoryExists"; path: string }
  | { type: "fileContains"; path: string; text: string }
  | { type: "processNotRunning"; name: string }
  | { type: "processRunning"; name: string }
  | { type: "serviceRunning"; name: string }
  | { type: "portOpen"; port: number }
  | { type: "packageInstalled"; name: string }
  | { type: "commandExitCode"; command: string; expected: number }
  | { type: "commandOutputContains"; command: string; text: string }
  | { type: "dockerContainerRunning"; name: string }
  | { type: "k8sResourceExists"; kind: string; name: string; namespace?: string };

export type ValidationSpec = {
  checks: ValidationCheck[];
};

export type Hint = {
  level: number;
  textFa: string;
};

export type LabSetup = {
  commands?: string[];
};

export type AiGradeResult = {
  score: number;
  feedbackFa: string;
  mistakes: string[];
  correctExplanationFa: string;
  recommendedTopics: string[];
};
