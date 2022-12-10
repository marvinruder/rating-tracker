export const sortableAttributeArray = [
  "name",
  "size",
  "style",
  "starRating",
  "dividendYieldPercent",
  "priceEarningRatio",
  "morningstarFairValue",
  "52w",
  "msciESGRating",
  "msciTemperature",
] as const;

export type SortableAttribute = typeof sortableAttributeArray[number];
