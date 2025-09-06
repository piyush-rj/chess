-- AlterTable
ALTER TABLE "public"."games" ADD COLUMN     "isRanked" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timeControl" TEXT;

-- AlterTable
ALTER TABLE "public"."moves" ADD COLUMN     "algebraicNotation" TEXT,
ADD COLUMN     "isCastle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isEnPassant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promotion" "public"."PieceType",
ADD COLUMN     "timeSpent" INTEGER;
