/*
  Warnings:

  - You are about to drop the column `userId` on the `UserResponse` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `UserResponse` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserResponse" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "UserResponse_email_key" ON "UserResponse"("email");
