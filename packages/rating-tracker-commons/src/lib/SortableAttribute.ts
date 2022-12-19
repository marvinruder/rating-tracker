export const sortableAttributeArray = [
  "name",
  "size",
  "style",
  "starRating",
  "dividendYieldPercent",
  "priceEarningRatio",
  "morningstarFairValue",
  "52w",
  "analystConsensus",
  "analystTargetPrice",
  "msciESGRating",
  "msciTemperature",
  "refinitivESGScore",
  "refinitivEmissions",
  "spESGScore",
  "sustainalyticsESGRisk",
  "financialScore",
  "esgScore",
  "totalScore",
] as const;

export type SortableAttribute = typeof sortableAttributeArray[number];

export function isSortableAttribute(s: string): s is SortableAttribute {
  return sortableAttributeArray.includes(s as SortableAttribute);
}
