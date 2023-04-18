/**
 * An array of all MSCI ESG Rating values.
 */
export const msciESGRatingArray = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC"] as const;

/**
 * An MSCI ESG Rating value.
 */
export type MSCIESGRating = (typeof msciESGRatingArray)[number];

/**
 * Checks if a string is a valid MSCI ESG Rating value.
 * @param {string} value The string to check.
 * @returns {boolean} True if the string is a valid MSCI ESG Rating value.
 */
export function isMSCIESGRating(value: string): value is MSCIESGRating {
  return msciESGRatingArray.includes(value as MSCIESGRating);
}
