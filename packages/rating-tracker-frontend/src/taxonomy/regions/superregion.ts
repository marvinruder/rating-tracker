import { Region, regionArray, SuperRegion } from "src/types";

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
