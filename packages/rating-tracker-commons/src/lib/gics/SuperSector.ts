import { Sector, sectorArray } from "./Sector.js";

export const superSectorArray = ["Cyclical", "Defensive", "Sensitive"] as const;

export type SuperSector = typeof superSectorArray[number];

export function isSuperSector(s: string): s is SuperSector {
  return superSectorArray.includes(s as SuperSector);
}

export const superSectorName: Record<SuperSector, string> = {
  Cyclical: "Cyclical",
  Defensive: "Defensive",
  Sensitive: "Sensitive",
};

export const superSectorOfSector: Record<Sector, SuperSector> = {
  BasicMaterials: "Cyclical",
  ConsumerCyclical: "Cyclical",
  FinancialServices: "Cyclical",
  RealEstate: "Cyclical",
  ConsumerDefensive: "Defensive",
  HealthCare: "Defensive",
  Utilities: "Defensive",
  CommunicationServices: "Sensitive",
  Energy: "Sensitive",
  Industrials: "Sensitive",
  Technology: "Sensitive",
};

export const getSectorsInSuperSector = (superSector: SuperSector): Sector[] => {
  return sectorArray.filter(
    (sector) => superSectorOfSector[sector] == superSector
  );
};
