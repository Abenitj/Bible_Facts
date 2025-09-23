/*
  Warnings:

  - You are about to drop the column `bibleVerses` on the `topic_details` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `topic_details` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `topic_details` table. All the data in the column will be lost.
  - You are about to drop the column `keyPoints` on the `topic_details` table. All the data in the column will be lost.
  - You are about to drop the column `references` on the `topic_details` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_topic_details" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topicId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "useBlocks" BOOLEAN NOT NULL DEFAULT true,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "topic_details_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_topic_details" ("createdAt", "id", "syncStatus", "topicId", "updatedAt", "useBlocks", "version") SELECT "createdAt", "id", "syncStatus", "topicId", "updatedAt", "useBlocks", "version" FROM "topic_details";
DROP TABLE "topic_details";
ALTER TABLE "new_topic_details" RENAME TO "topic_details";
CREATE UNIQUE INDEX "topic_details_topicId_key" ON "topic_details"("topicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
