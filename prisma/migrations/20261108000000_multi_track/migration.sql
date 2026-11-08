-- Multi-track: preserve DailyLesson.id and Progress FKs
PRAGMA foreign_keys=OFF;

CREATE TABLE "Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Track_slug_key" ON "Track"("slug");
CREATE UNIQUE INDEX "Track_order_key" ON "Track"("order");

INSERT INTO "Track" ("id", "slug", "titleFa", "titleEn", "descriptionFa", "order", "status", "createdAt", "updatedAt")
VALUES
  ('track_devops_sre', 'devops-sre', 'DevOps و SRE', 'DevOps & SRE', 'مسیر ساختاریافته از لینوکس تا پلتفرم و SRE.', 1, 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('track_backend_go', 'backend-go', 'Backend و Golang', 'Backend Engineering & Go', 'آمادگی مصاحبه Mid/Senior با تمرکز روی Go، الگوریتم، دیتابیس و طراحی سیستم.', 2, 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

CREATE TABLE "new_Phase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "weekStart" INTEGER NOT NULL,
    "weekEnd" INTEGER NOT NULL,
    CONSTRAINT "Phase_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Phase" ("id", "trackId", "slug", "titleFa", "titleEn", "descriptionFa", "order", "weekStart", "weekEnd")
SELECT "id", 'track_devops_sre', "slug", "titleFa", "titleEn", "descriptionFa", "order", "weekStart", "weekEnd" FROM "Phase";
DROP TABLE "Phase";
ALTER TABLE "new_Phase" RENAME TO "Phase";
CREATE UNIQUE INDEX "Phase_trackId_slug_key" ON "Phase"("trackId", "slug");
CREATE UNIQUE INDEX "Phase_trackId_order_key" ON "Phase"("trackId", "order");
CREATE INDEX "Phase_trackId_idx" ON "Phase"("trackId");

CREATE TABLE "new_Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionFa" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "weaknessThreshold" REAL NOT NULL DEFAULT 0.6,
    CONSTRAINT "Topic_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Topic_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Topic" ("id", "trackId", "phaseId", "slug", "titleFa", "titleEn", "descriptionFa", "order", "weaknessThreshold")
SELECT "id", 'track_devops_sre', "phaseId", "slug", "titleFa", "titleEn", "descriptionFa", "order", "weaknessThreshold" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
CREATE UNIQUE INDEX "Topic_trackId_slug_key" ON "Topic"("trackId", "slug");
CREATE INDEX "Topic_phaseId_idx" ON "Topic"("phaseId");
CREATE INDEX "Topic_trackId_idx" ON "Topic"("trackId");

CREATE TABLE "new_DailyLesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
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
    CONSTRAINT "DailyLesson_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DailyLesson_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyLesson" ("id", "trackId", "dayNumber", "phaseId", "titleFa", "objectiveFa", "passingScore", "theoryWeight", "practicalWeight", "scenarioWeight", "examWeight", "status")
SELECT "id", 'track_devops_sre', "dayNumber", "phaseId", "titleFa", "objectiveFa", "passingScore", "theoryWeight", "practicalWeight", "scenarioWeight", "examWeight", "status" FROM "DailyLesson";
DROP TABLE "DailyLesson";
ALTER TABLE "new_DailyLesson" RENAME TO "DailyLesson";
CREATE UNIQUE INDEX "DailyLesson_trackId_dayNumber_key" ON "DailyLesson"("trackId", "dayNumber");
CREATE INDEX "DailyLesson_trackId_idx" ON "DailyLesson"("trackId");
CREATE INDEX "DailyLesson_phaseId_idx" ON "DailyLesson"("phaseId");

CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT,
    "slug" TEXT NOT NULL,
    "titleFa" TEXT NOT NULL,
    "descriptionMd" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "injectedFailures" JSONB,
    "minLevelOrder" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    CONSTRAINT "Project_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("id", "trackId", "slug", "titleFa", "descriptionMd", "order", "isFinal", "injectedFailures", "minLevelOrder", "status")
SELECT "id", 'track_devops_sre', "slug", "titleFa", "descriptionMd", "order", "isFinal", "injectedFailures", "minLevelOrder", "status" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE UNIQUE INDEX "Project_order_key" ON "Project"("order");
CREATE INDEX "Project_trackId_idx" ON "Project"("trackId");

CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "currentLevelId" TEXT,
    "activeTrackId" TEXT,
    "currentDayNumber" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Profile_currentLevelId_fkey" FOREIGN KEY ("currentLevelId") REFERENCES "Level" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Profile_activeTrackId_fkey" FOREIGN KEY ("activeTrackId") REFERENCES "Track" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("id", "userId", "displayName", "currentLevelId", "activeTrackId", "currentDayNumber", "xp", "streak", "lastStudyDate", "createdAt", "updatedAt")
SELECT "id", "userId", "displayName", "currentLevelId", 'track_devops_sre', "currentDayNumber", "xp", "streak", "lastStudyDate", "createdAt", "updatedAt" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

CREATE TABLE "UserTrackProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "currentDayNumber" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserTrackProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserTrackProgress_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "UserTrackProgress_userId_trackId_key" ON "UserTrackProgress"("userId", "trackId");
CREATE INDEX "UserTrackProgress_userId_idx" ON "UserTrackProgress"("userId");
CREATE INDEX "UserTrackProgress_trackId_idx" ON "UserTrackProgress"("trackId");

INSERT INTO "UserTrackProgress" ("id", "userId", "trackId", "currentDayNumber", "xp", "streak", "lastStudyDate", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(12))),
  p."userId",
  'track_devops_sre',
  p."currentDayNumber",
  p."xp",
  p."streak",
  p."lastStudyDate",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Profile" p;

PRAGMA foreign_keys=ON;
