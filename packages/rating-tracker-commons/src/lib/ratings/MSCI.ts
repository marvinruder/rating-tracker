export const msciESGRatingArray = [
  "AAA",
  "AA",
  "A",
  "BBB",
  "BB",
  "B",
  "CCC",
] as const;

export type MSCIESGRating = (typeof msciESGRatingArray)[number];

export function isMSCIESGRating(value: string): value is MSCIESGRating {
  return msciESGRatingArray.includes(value as MSCIESGRating);
}
