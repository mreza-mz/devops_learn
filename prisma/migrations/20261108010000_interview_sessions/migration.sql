-- CreateTable InterviewSession
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "questionIdsJson" JSONB NOT NULL,
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "categoryScoresJson" JSONB,
    "overallScore" REAL,
    "strengthsJson" JSONB,
    "weaknessesJson" JSONB,
    "recommendedLessonsJson" JSONB,
    "reportSummaryFa" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "InterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InterviewSession_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "InterviewSession_userId_trackId_idx" ON "InterviewSession"("userId", "trackId");
CREATE INDEX "InterviewSession_userId_status_idx" ON "InterviewSession"("userId", "status");

-- CreateTable InterviewAnswer
CREATE TABLE "InterviewAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "answerText" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "feedbackFa" TEXT,
    "mistakesJson" JSONB,
    "followUpFa" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterviewAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "InterviewAnswer_sessionId_orderIndex_key" ON "InterviewAnswer"("sessionId", "orderIndex");
CREATE INDEX "InterviewAnswer_sessionId_idx" ON "InterviewAnswer"("sessionId");
