-- CreateEnum
CREATE TYPE "AnalystRating" AS ENUM ('Sell', 'Underperform', 'Hold', 'Outperform', 'Buy');

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "analystRatings" JSONB,
DROP COLUMN "analystConsensus",
ADD COLUMN     "analystConsensus" "AnalystRating";
