export const superSectorArray = ["Cyclical", "Defensive", "Sensitive"] as const;

export type SuperSector = typeof superSectorArray[number];

export function isSuperSector(s: string): s is SuperSector {
  return superSectorArray.includes(s as SuperSector);
}
