/* eslint-disable max-len */
import type { Sector } from "./Sector";
import { sectorArray } from "./Sector";

/**
 * An array of super sectors in the Morningstar Global Equity Classification Structure.
 */
export const superSectorArray = ["Cyclical", "Defensive", "Sensitive"] as const;

/**
 * A super sector in the Morningstar Global Equity Classification Structure.
 */
export type SuperSector = (typeof superSectorArray)[number];

/**
 * Checks if a string is a valid super sector.
 * @param s The string to check.
 * @returns True if the string is a valid super sector.
 */
export function isSuperSector(s: string): s is SuperSector {
  return superSectorArray.includes(s as SuperSector);
}

/**
 * A record of super sector names for each super sector.
 */
export const superSectorName: Record<SuperSector, string> = {
  Cyclical: "Cyclical",
  Defensive: "Defensive",
  Sensitive: "Sensitive",
};

/**
 * A record of descriptions for each super sector.
 */
export const superSectorDescription: Record<SuperSector, string> = {
  Cyclical:
    "The cyclical Super Sector includes industries significantly affected by economic shifts. When the economy is prosperous, these industries tend to expand, and when the economy is in a downturn they tend to shrink.",
  Defensive:
    "The defensive Super Sector includes industries that are relatively immune to economic cycles. These industries provide services that consumers require in both good and bad times, such as healthcare and utilities.",
  Sensitive:
    "The sensitive Super Sector includes industries that ebb and flow with the overall economy, but not severely. Sensitive industries fall between defensive and cyclical, as they are not immune to a poor economy, but they also may not be as severely affected as industries in the cyclical Super Sector.",
};

/**
 * A record associating each sector with its super sector.
 */
export const superSectorOfSector: Record<Sector, SuperSector> = {
  BasicMaterials: "Cyclical",
  ConsumerCyclical: "Cyclical",
  FinancialServices: "Cyclical",
  RealEstate: "Cyclical",
  ConsumerDefensive: "Defensive",
  Healthcare: "Defensive",
  Utilities: "Defensive",
  CommunicationServices: "Sensitive",
  Energy: "Sensitive",
  Industrials: "Sensitive",
  Technology: "Sensitive",
};

/**
 * Returns an array of all sectors in a super sector.
 * @param superSector The super sector to get  sectors for.
 * @returns The array of sectors in the super sector.
 */
export const getSectorsInSuperSector = (superSector: SuperSector): Sector[] => {
  return sectorArray.filter((sector) => superSectorOfSector[sector] == superSector);
};
