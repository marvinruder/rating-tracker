export const regionArray = [
  "NorthAmerica",
  "LatinAmerica",
  "UnitedKingdom",
  "Eurozone",
  "EuropeDeveloped",
  "EuropeEmerging",
  "AfricaME",
  "Japan",
  "Australasia",
  "AsiaDeveloped",
  "AsiaEmerging",
] as const;

export type Region = typeof regionArray[number];

export function isRegion(s: string): s is Region {
  return regionArray.includes(s as Region);
}
