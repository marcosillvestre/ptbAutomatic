/*
  Warnings:

  - You are about to drop the column `createdAt` on the `conec` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "conec" DROP COLUMN "createdAt";

-- CreateTable
CREATE TABLE "index" (
    "id" SERIAL NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,

    CONSTRAINT "index_pkey" PRIMARY KEY ("id")
);
