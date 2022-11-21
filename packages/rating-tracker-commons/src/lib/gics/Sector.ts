export const sectorArray = [
  "BasicMaterials",
  "ConsumerCyclical",
  "FinancialServices",
  "RealEstate",
  "ConsumerDefensive",
  "HealthCare",
  "Utilities",
  "CommunicationServices",
  "Energy",
  "Industrials",
  "Technology",
] as const;

export type Sector = typeof sectorArray[number];

export function isSector(s: string): s is Sector {
  return sectorArray.includes(s as Sector);
}
