/**
 * An array of all MSCI ESG Rating values.
 */
export const msciESGRatingArray = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC"] as const;

/**
 * An MSCI ESG Rating value.
 */
export type MSCIESGRating = (typeof msciESGRatingArray)[number];

/**
 * Checks if an entity is a valid MSCI ESG Rating value.
 * @param entity The entity to check.
 * @returns True if the entity is a valid MSCI ESG Rating value.
 */
export function isMSCIESGRating(entity: unknown): entity is MSCIESGRating {
  return msciESGRatingArray.includes(entity as MSCIESGRating);
}
