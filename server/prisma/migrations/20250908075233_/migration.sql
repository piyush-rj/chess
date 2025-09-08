/*
  Warnings:

  - The values [ENDED] on the enum `GameStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."GameStatus_new" AS ENUM ('WAITING', 'ACTIVE', 'CHECK', 'CHECKMATE', 'STALEMATE', 'DRAW', 'ABANDONED', 'IN_PROGRESS');
ALTER TABLE "public"."games" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."games" ALTER COLUMN "status" TYPE "public"."GameStatus_new" USING ("status"::text::"public"."GameStatus_new");
ALTER TYPE "public"."GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "public"."GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "public"."GameStatus_old";
ALTER TABLE "public"."games" ALTER COLUMN "status" SET DEFAULT 'WAITING';
COMMIT;

-- CreateTable
CREATE TABLE "public"."CapturedPiece" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "piece" "public"."PieceType" NOT NULL,
    "color" "public"."Color" NOT NULL,
    "moveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapturedPiece_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CapturedPiece" ADD CONSTRAINT "CapturedPiece_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CapturedPiece" ADD CONSTRAINT "CapturedPiece_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "public"."moves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
