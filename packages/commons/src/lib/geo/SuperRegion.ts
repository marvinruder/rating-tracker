import type { Region } from "./Region";
import { regionArray } from "./Region";

/**
 * An array of super region identifiers.
 */
export const superRegionArray = ["Americas", "EMEA", "Asia"] as const;

/**
 * A super region.
 */
export type SuperRegion = (typeof superRegionArray)[number];

/**
 * Checks if a string is a valid super region.
 * @param s The string to check.
 * @returns True if the string is a valid super region.
 */
export function isSuperRegion(s: string): s is SuperRegion {
  return superRegionArray.includes(s as SuperRegion);
}

/**
 * A record of super region names for each super region.
 */
export const superRegionName: Record<SuperRegion, string> = {
  Americas: "The Americas",
  EMEA: "Greater Europe",
  Asia: "Greater Asia",
};

/**
 * A record associating each region with its super region.
 */
export const superRegionOfRegion: Record<Region, SuperRegion> = {
  NorthAmerica: "Americas",
  LatinAmerica: "Americas",
  UnitedKingdom: "EMEA",
  Eurozone: "EMEA",
  EuropeDeveloped: "EMEA",
  EuropeEmerging: "EMEA",
  AfricaME: "EMEA",
  Japan: "Asia",
  Australasia: "Asia",
  AsiaDeveloped: "Asia",
  AsiaEmerging: "Asia",
};

/**
 * Returns an array of all regions in a super region.
 * @param superRegion The super region to get regions for.
 * @returns The array of regions in the super given region.
 */
export const getRegionsInSuperRegion = (superRegion: SuperRegion): Region[] => {
  return regionArray.filter((region) => superRegionOfRegion[region] == superRegion);
};

/**
 * Returns the emoji globe for a super region.
 * @param superRegion The super region
 * @returns An emoji of the super region’s globe
 */
export const emojiGlobe = (superRegion: SuperRegion): string =>
  ({
    Americas: "🌎",
    EMEA: "🌍",
    Asia: "🌏",
  })[superRegion];
