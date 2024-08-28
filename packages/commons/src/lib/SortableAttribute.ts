/**
 * An array of attribute names by which a list of stocks can be sorted.
 */
export const sortableAttributeArray =
  // : Partial<(keyof Stock)[]>
  [
    "ticker",
    "name",
    "size",
    "style",
    "starRating",
    "dividendYieldPercent",
    "priceEarningRatio",
    "morningstarFairValuePercentageToLastClose",
    "positionIn52w",
    "analystConsensus",
    "analystTargetPricePercentageToLastClose",
    "msciESGRating",
    "msciTemperature",
    "lsegESGScore",
    "lsegEmissions",
    "spESGScore",
    "sustainalyticsESGRisk",
    "financialScore",
    "esgScore",
    "totalScore",
    "amount",
  ] as const;

/**
 * An attribute name by which a list of stocks can be sorted.
 */
export type SortableAttribute = (typeof sortableAttributeArray)[number];

/**
 * Checks if an entity is a valid attribute name by which a list of stocks can be sorted.
 * @param entity The entity to check.
 * @returns True if the entity is a valid attribute name by which a list of stocks can be sorted.
 */
export function isSortableAttribute(entity: unknown): entity is SortableAttribute {
  return sortableAttributeArray.includes(entity as SortableAttribute);
}
