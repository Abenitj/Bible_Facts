-- CreateTable
CREATE TABLE "religions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#8B4513',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "topics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "religionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "topics_religionId_fkey" FOREIGN KEY ("religionId") REFERENCES "religions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "topic_details" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topicId" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "bibleVerses" TEXT,
    "keyPoints" TEXT,
    "references" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "topic_details_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "topic_details_topicId_key" ON "topic_details"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
