/*
  Warnings:

  - You are about to drop the column `isCastle` on the `moves` table. All the data in the column will be lost.
  - You are about to drop the column `isEnPassant` on the `moves` table. All the data in the column will be lost.
  - You are about to drop the column `promotion` on the `moves` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."moves" DROP COLUMN "isCastle",
DROP COLUMN "isEnPassant",
DROP COLUMN "promotion";
