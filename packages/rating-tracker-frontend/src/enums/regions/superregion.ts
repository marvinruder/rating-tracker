import { Country } from "./country";
import { getRegionFromCountry, Region } from "./region";

export enum SuperRegion {
  Americas = "The Americas",
  EMEA = "Greater Europe",
  Asia = "Greater Asia",
}

const regionsInSuperRegions = new Map<SuperRegion, Region[]>();

regionsInSuperRegions.set(SuperRegion.Americas, [
  Region.NorthAmerica,
  Region.LatinAmerica,
]);

regionsInSuperRegions.set(SuperRegion.EMEA, [
  Region.UnitedKingdom,
  Region.Eurozone,
  Region.EuropeDeveloped,
  Region.EuropeEmerging,
  Region.AfricaME,
]);

regionsInSuperRegions.set(SuperRegion.Asia, [
  Region.Japan,
  Region.Australasia,
  Region.AsiaDeveloped,
  Region.AsiaEmerging,
]);

export const getSuperRegionFromRegion = (region: Region) => {
  const superRegionsContainingRegion: SuperRegion[] = [];
  regionsInSuperRegions.forEach((regions, superRegion) => {
    if (regions.includes(region)) {
      superRegionsContainingRegion.push(superRegion);
    }
  });
  if (superRegionsContainingRegion.length != 1) {
    throw new ReferenceError(
      "The region " + region + " is not in exactly one super region"
    );
  }
  return superRegionsContainingRegion[0];
};

export const getSuperRegionFromCountry = (country: Country) => {
  return getSuperRegionFromRegion(getRegionFromCountry(country));
};

export const getRegionsInSuperRegions = (
  superRegion: SuperRegion
): Region[] => {
  return regionsInSuperRegions.get(superRegion);
};
