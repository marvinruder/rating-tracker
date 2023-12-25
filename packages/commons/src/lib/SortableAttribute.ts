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
 * Checks if a string is a valid attribute name by which a list of stocks can be sorted.
 *
 * @param {string} s The string to check.
 * @returns {boolean} True if the string is a valid attribute name by which a list of stocks can be sorted.
 */
export function isSortableAttribute(s: string): s is SortableAttribute {
  return sortableAttributeArray.includes(s as SortableAttribute);
}
