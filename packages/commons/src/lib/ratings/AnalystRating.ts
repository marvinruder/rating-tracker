/**
 * An array of all Analyst Rating values.
 */
export const analystRatingArray = ["Sell", "Underperform", "Hold", "Outperform", "Buy"] as const;

/**
 * An Analyst Rating value.
 */
export type AnalystRating = (typeof analystRatingArray)[number];

/**
 * Checks if a string is a valid Analyst Rating value.
 * @param value The string to check.
 * @returns True if the string is a valid Analyst Rating value.
 */
export function isAnalystRating(value: string): value is AnalystRating {
  return analystRatingArray.includes(value as AnalystRating);
}
