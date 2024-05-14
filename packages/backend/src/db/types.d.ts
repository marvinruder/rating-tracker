import type { AnalystRating } from "@rating-tracker/commons";

declare global {
  namespace PrismaJSON {
    type AnalystRatings = Record<AnalystRating, number>;
  }
}
