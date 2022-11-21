export const superRegionArray = ["Americas", "EMEA", "Asia"] as const;

export type SuperRegion = typeof superRegionArray[number];

export function isSuperRegion(s: string): s is SuperRegion {
  return superRegionArray.includes(s as SuperRegion);
}
