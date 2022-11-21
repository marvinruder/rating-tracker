export const sortableAttributeArray = [
  "name",
  "size",
  "style",
  "starRating",
  "dividendYieldPercent",
  "priceEarningRatio",
] as const;

export type SortableAttribute = typeof sortableAttributeArray[number];
