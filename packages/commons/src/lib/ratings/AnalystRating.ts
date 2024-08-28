/**
 * An array of all Analyst Rating values.
 */
export const analystRatingArray = ["Sell", "Underperform", "Hold", "Outperform", "Buy"] as const;

/**
 * An Analyst Rating value.
 */
export type AnalystRating = (typeof analystRatingArray)[number];

/**
 * Checks if an entity is a valid Analyst Rating value.
 * @param entity The entity to check.
 * @returns True if the entity is a valid Analyst Rating value.
 */
export function isAnalystRating(entity: unknown): entity is AnalystRating {
  return analystRatingArray.includes(entity as AnalystRating);
}
