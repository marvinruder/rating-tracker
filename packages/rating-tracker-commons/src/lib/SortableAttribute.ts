export const sortableAttributeArray = [
  "name",
  "size",
  "style",
  "starRating",
  "dividendYieldPercent",
  "priceEarningRatio",
  "morningstarFairValue",
  "marketCap",
  "52w",
] as const;

export type SortableAttribute = typeof sortableAttributeArray[number];
