import { Region, regionArray } from "./Region.js";

export const superRegionArray = ["Americas", "EMEA", "Asia"] as const;

export type SuperRegion = typeof superRegionArray[number];

export function isSuperRegion(s: string): s is SuperRegion {
  return superRegionArray.includes(s as SuperRegion);
}

export const superRegionName: Record<SuperRegion, string> = {
  Americas: "The Americas",
  EMEA: "Greater Europe",
  Asia: "Greater Asia",
};

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

export const getRegionsInSuperRegion = (superRegion: SuperRegion): Region[] => {
  return regionArray.filter(
    (region) => superRegionOfRegion[region] == superRegion
  );
};
