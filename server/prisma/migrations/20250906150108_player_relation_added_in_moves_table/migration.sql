/*
  Warnings:

  - Added the required column `playerId` to the `moves` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."moves" ADD COLUMN     "playerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."moves" ADD CONSTRAINT "moves_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
