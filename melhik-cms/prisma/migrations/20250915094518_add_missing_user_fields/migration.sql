-- AlterTable
ALTER TABLE "users" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "users" ADD COLUMN "firstName" TEXT;
ALTER TABLE "users" ADD COLUMN "lastName" TEXT;

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topicDetailId" INTEGER NOT NULL,
    "blockType" TEXT NOT NULL,
    "contentData" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "content_blocks_topicDetailId_fkey" FOREIGN KEY ("topicDetailId") REFERENCES "topic_details" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_religions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#8B4513',
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_religions" ("color", "createdAt", "description", "id", "name", "nameEn", "updatedAt") SELECT "color", "createdAt", "description", "id", "name", "nameEn", "updatedAt" FROM "religions";
DROP TABLE "religions";
ALTER TABLE "new_religions" RENAME TO "religions";
CREATE TABLE "new_topic_details" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topicId" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "bibleVerses" TEXT,
    "keyPoints" TEXT,
    "references" TEXT,
    "images" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "useBlocks" BOOLEAN NOT NULL DEFAULT false,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "topic_details_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_topic_details" ("bibleVerses", "createdAt", "explanation", "id", "keyPoints", "references", "topicId", "updatedAt", "version") SELECT "bibleVerses", "createdAt", "explanation", "id", "keyPoints", "references", "topicId", "updatedAt", "version" FROM "topic_details";
DROP TABLE "topic_details";
ALTER TABLE "new_topic_details" RENAME TO "topic_details";
CREATE UNIQUE INDEX "topic_details_topicId_key" ON "topic_details"("topicId");
CREATE TABLE "new_topics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "religionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "topics_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "religions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_topics" ("createdAt", "description", "id", "religionId", "title", "titleEn", "updatedAt") SELECT "createdAt", "description", "id", "religionId", "title", "titleEn", "updatedAt" FROM "topics";
DROP TABLE "topics";
ALTER TABLE "new_topics" RENAME TO "topics";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
