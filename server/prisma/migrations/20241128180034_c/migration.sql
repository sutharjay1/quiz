-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_quizId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "quizId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
