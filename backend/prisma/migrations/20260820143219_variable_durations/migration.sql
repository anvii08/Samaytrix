/*
  Warnings:

  - You are about to drop the column `numberOfPeriods` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `periodDuration` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `periodNumber` on the `Substitution` table. All the data in the column will be lost.
  - You are about to drop the column `periodNumber` on the `TimetableSlot` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Substitution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Substitution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `TimetableSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `TimetableSlot` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "workingDays" TEXT NOT NULL
);
INSERT INTO "new_School" ("endTime", "id", "name", "startTime", "workingDays") SELECT "endTime", "id", "name", "startTime", "workingDays" FROM "School";
DROP TABLE "School";
ALTER TABLE "new_School" RENAME TO "School";
CREATE TABLE "new_Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requiresLab" BOOLEAN NOT NULL DEFAULT false,
    "labType" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 40
);
INSERT INTO "new_Subject" ("category", "id", "labType", "name", "requiresLab") SELECT "category", "id", "labType", "name", "requiresLab" FROM "Subject";
DROP TABLE "Subject";
ALTER TABLE "new_Subject" RENAME TO "Subject";
CREATE TABLE "new_Substitution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "reason" TEXT,
    "originalTeacherId" TEXT NOT NULL,
    "substituteTeacherId" TEXT,
    CONSTRAINT "Substitution_originalTeacherId_fkey" FOREIGN KEY ("originalTeacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Substitution_substituteTeacherId_fkey" FOREIGN KEY ("substituteTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Substitution" ("classId", "date", "id", "originalTeacherId", "reason", "substituteTeacherId") SELECT "classId", "date", "id", "originalTeacherId", "reason", "substituteTeacherId" FROM "Substitution";
DROP TABLE "Substitution";
ALTER TABLE "new_Substitution" RENAME TO "Substitution";
CREATE TABLE "new_TimetableSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isExtracurricular" BOOLEAN NOT NULL DEFAULT false,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "labId" TEXT,
    CONSTRAINT "TimetableSlot_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TimetableSlot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TimetableSlot_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TimetableSlot_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TimetableSlot" ("classId", "dayOfWeek", "id", "isExtracurricular", "labId", "subjectId", "teacherId") SELECT "classId", "dayOfWeek", "id", "isExtracurricular", "labId", "subjectId", "teacherId" FROM "TimetableSlot";
DROP TABLE "TimetableSlot";
ALTER TABLE "new_TimetableSlot" RENAME TO "TimetableSlot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
