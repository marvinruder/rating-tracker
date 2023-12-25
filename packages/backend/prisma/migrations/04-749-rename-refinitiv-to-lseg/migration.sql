-- AlterTable
ALTER TABLE "Stock" RENAME COLUMN "refinitivESGScore" TO "lsegESGScore";
ALTER TABLE "Stock" RENAME COLUMN "refinitivEmissions" TO "lsegEmissions";
ALTER TABLE "Stock" RENAME COLUMN "refinitivLastFetch" TO "lsegLastFetch";
