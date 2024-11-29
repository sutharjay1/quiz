/*
  Warnings:

  - Added the required column `results` to the `UserResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserResponse" ADD COLUMN     "results" JSONB NOT NULL;
