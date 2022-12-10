export const msciESGRatingArray = [
  "AAA",
  "AA",
  "A",
  "BBB",
  "BB",
  "B",
  "CCC",
] as const;

export type MSCIESGRating = typeof msciESGRatingArray[number];
