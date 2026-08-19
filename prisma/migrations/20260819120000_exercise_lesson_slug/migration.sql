-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN "lessonSlug" TEXT;

-- CreateIndex
CREATE INDEX "Exercise_lessonSlug_idx" ON "Exercise"("lessonSlug");
