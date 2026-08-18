-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "currentLevelId" TEXT,
    "currentDayNumber" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "Level" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "weekStart" INTEGER NOT NULL,
    "weekEnd" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "minXp" INTEGER NOT NULL,
    "requirements" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phaseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "weaknessThreshold" REAL NOT NULL DEFAULT 0.6,
    CONSTRAINT "Topic_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "dailyLessonId" TEXT,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "objectiveFa" TEXT NOT NULL,
    "theoryMd" TEXT NOT NULL,
    "practicalMd" TEXT NOT NULL,
    "exampleMd" TEXT NOT NULL,
    "commandsJson" JSONB,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lesson_dailyLessonId_fkey" FOREIGN KEY ("dailyLessonId") REFERENCES "DailyLesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyLesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayNumber" INTEGER NOT NULL,
    "phaseId" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "objectiveFa" TEXT NOT NULL,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "theoryWeight" INTEGER NOT NULL DEFAULT 20,
    "practicalWeight" INTEGER NOT NULL DEFAULT 30,
    "scenarioWeight" INTEGER NOT NULL DEFAULT 20,
    "examWeight" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    CONSTRAINT "DailyLesson_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyLessonId" TEXT,
    "topicId" TEXT,
    "projectTaskId" TEXT,
    "titleFa" TEXT NOT NULL,
    "instructionsMd" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "labImage" TEXT NOT NULL DEFAULT 'devops-learn-lab:latest',
    "labSetupJson" JSONB,
    "validationJson" JSONB NOT NULL,
    "hintsJson" JSONB NOT NULL,
    "hintPenalty" INTEGER NOT NULL DEFAULT 5,
    "maxScore" INTEGER NOT NULL DEFAULT 6,
    "networkMode" TEXT NOT NULL DEFAULT 'none',
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exercise_dailyLessonId_fkey" FOREIGN KEY ("dailyLessonId") REFERENCES "DailyLesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "validationResult" JSONB,
    "feedbackFa" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ExerciseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExerciseAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyLessonId" TEXT,
    "projectId" TEXT,
    "titleFa" TEXT NOT NULL,
    "incidentMd" TEXT NOT NULL,
    "symptomsMd" TEXT NOT NULL,
    "observabilityMd" TEXT NOT NULL,
    "environmentMd" TEXT NOT NULL,
    "hiddenRootCause" TEXT NOT NULL,
    "investigationPath" JSONB NOT NULL,
    "validationJson" JSONB NOT NULL,
    "difficulty" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 20,
    "labSetupJson" JSONB,
    "labImage" TEXT NOT NULL DEFAULT 'devops-learn-lab:latest',
    "networkMode" TEXT NOT NULL DEFAULT 'none',
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductionScenario_dailyLessonId_fkey" FOREIGN KEY ("dailyLessonId") REFERENCES "DailyLesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionScenario_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScenarioAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "validationResult" JSONB,
    "feedbackFa" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ScenarioAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScenarioAttempt_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "ProductionScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyLessonId" TEXT,
    "titleFa" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 30,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "timeLimitSec" INTEGER NOT NULL DEFAULT 1200,
    "questionCount" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topicDistribution" JSONB,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exam_dailyLessonId_fkey" FOREIGN KEY ("dailyLessonId") REFERENCES "DailyLesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "topicId" TEXT,
    "type" TEXT NOT NULL,
    "promptFa" TEXT NOT NULL,
    "optionsJson" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanationFa" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamQuestion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "score" REAL NOT NULL,
    "feedbackFa" TEXT,
    "mistakesJson" JSONB,
    CONSTRAINT "Answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExamQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "descriptionMd" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "injectedFailures" JSONB,
    "minLevelOrder" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'APPROVED'
);

-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "instructionsMd" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "validationJson" JSONB NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 10,
    CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "status" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    "evidenceJson" JSONB,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ProjectAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectAttempt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectAttempt_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    CONSTRAINT "Skill_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "skillId" TEXT,
    "scoreAvg" REAL NOT NULL DEFAULT 0,
    "sampleCount" INTEGER NOT NULL DEFAULT 0,
    "lastScore" REAL NOT NULL DEFAULT 0,
    "isWeak" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserSkill_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dailyLessonId" TEXT NOT NULL,
    "theoryScore" REAL NOT NULL DEFAULT 0,
    "practicalScore" REAL NOT NULL DEFAULT 0,
    "scenarioScore" REAL NOT NULL DEFAULT 0,
    "examScore" REAL NOT NULL DEFAULT 0,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "bestScore" REAL NOT NULL DEFAULT 0,
    "latestScore" REAL NOT NULL DEFAULT 0,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "theoryCompleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Progress_dailyLessonId_fkey" FOREIGN KEY ("dailyLessonId") REFERENCES "DailyLesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "scheduledFor" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "generatedExerciseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewQueue_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewQueue_generatedExerciseId_fkey" FOREIGN KEY ("generatedExerciseId") REFERENCES "Exercise" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "purpose" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptHash" TEXT NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "costEstimate" REAL,
    "success" BOOLEAN NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AILog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AILog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "AIRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "scenarioId" TEXT,
    "containerId" TEXT,
    "status" TEXT NOT NULL,
    "networkMode" TEXT NOT NULL DEFAULT 'none',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stoppedAt" DATETIME,
    CONSTRAINT "Lab_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lab_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lab_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "ProductionScenario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabCommand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "exitCode" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LabCommand_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabValidation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "resultsJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LabValidation_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "descriptionFa" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 50
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "achievementId"),
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "excellentScore" INTEGER NOT NULL DEFAULT 90,
    "weaknessThreshold" REAL NOT NULL DEFAULT 0.6,
    "hintPenalty" INTEGER NOT NULL DEFAULT 5,
    "labCpuLimit" TEXT NOT NULL DEFAULT '0.5',
    "labMemoryLimit" TEXT NOT NULL DEFAULT '512m',
    "labTimeoutSeconds" INTEGER NOT NULL DEFAULT 1800,
    "labMaxProcesses" INTEGER NOT NULL DEFAULT 64,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "requireAiApproval" BOOLEAN NOT NULL DEFAULT true,
    "theoryWeight" INTEGER NOT NULL DEFAULT 20,
    "practicalWeight" INTEGER NOT NULL DEFAULT 30,
    "scenarioWeight" INTEGER NOT NULL DEFAULT 20,
    "examWeight" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Phase_slug_key" ON "Phase"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Phase_order_key" ON "Phase"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Level_slug_key" ON "Level"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Level_order_key" ON "Level"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_phaseId_idx" ON "Topic"("phaseId");

-- CreateIndex
CREATE INDEX "Lesson_topicId_idx" ON "Lesson"("topicId");

-- CreateIndex
CREATE INDEX "Lesson_dailyLessonId_idx" ON "Lesson"("dailyLessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_dailyLessonId_slug_key" ON "Lesson"("dailyLessonId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLesson_dayNumber_key" ON "DailyLesson"("dayNumber");

-- CreateIndex
CREATE INDEX "Exercise_dailyLessonId_idx" ON "Exercise"("dailyLessonId");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_exerciseId_idx" ON "ExerciseAttempt"("userId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionScenario_dailyLessonId_key" ON "ProductionScenario"("dailyLessonId");

-- CreateIndex
CREATE INDEX "ScenarioAttempt_userId_scenarioId_idx" ON "ScenarioAttempt"("userId", "scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_dailyLessonId_key" ON "Exam"("dailyLessonId");

-- CreateIndex
CREATE INDEX "ExamQuestion_examId_idx" ON "ExamQuestion"("examId");

-- CreateIndex
CREATE INDEX "ExamAttempt_userId_examId_idx" ON "ExamAttempt"("userId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_order_key" ON "Project"("order");

-- CreateIndex
CREATE INDEX "ProjectAttempt_userId_projectId_idx" ON "ProjectAttempt"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "UserSkill_userId_idx" ON "UserSkill"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_userId_topicId_key" ON "UserSkill"("userId", "topicId");

-- CreateIndex
CREATE INDEX "Progress_userId_idx" ON "Progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_dailyLessonId_key" ON "Progress"("userId", "dailyLessonId");

-- CreateIndex
CREATE INDEX "ReviewQueue_userId_completed_idx" ON "ReviewQueue"("userId", "completed");

-- CreateIndex
CREATE INDEX "AIRequest_purpose_createdAt_idx" ON "AIRequest"("purpose", "createdAt");

-- CreateIndex
CREATE INDEX "AIRequest_promptHash_idx" ON "AIRequest"("promptHash");

-- CreateIndex
CREATE INDEX "Lab_userId_status_idx" ON "Lab"("userId", "status");

-- CreateIndex
CREATE INDEX "Lab_containerId_idx" ON "Lab"("containerId");

-- CreateIndex
CREATE INDEX "LabCommand_labId_idx" ON "LabCommand"("labId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_slug_key" ON "Achievement"("slug");
