import { Country } from "./country";
import { getRegionFromCountry, Region } from "./region";

export enum SuperRegion {
  Americas = "The Americas",
  EMEA = "Greater Europe",
  Asia = "Greater Asia",
}

const regionsInSuperRegions = new Map<SuperRegion, Set<Region>>();

regionsInSuperRegions.set(
  SuperRegion.Americas,
  new Set<Region>([Region.NorthAmerica, Region.LatinAmerica])
);

regionsInSuperRegions.set(
  SuperRegion.EMEA,
  new Set<Region>([
    Region.UnitedKingdom,
    Region.Eurozone,
    Region.EuropeDeveloped,
    Region.EuropeEmerging,
    Region.AfricaME,
  ])
);

regionsInSuperRegions.set(
  SuperRegion.Asia,
  new Set<Region>([
    Region.Japan,
    Region.Australasia,
    Region.AsiaDeveloped,
    Region.AsiaEmerging,
  ])
);

export const getSuperRegionFromRegion = (region: Region) => {
  const superRegionsContainingRegion = new Set<SuperRegion>();
  regionsInSuperRegions.forEach((regionSet, superRegion) => {
    if (regionSet.has(region)) {
      superRegionsContainingRegion.add(superRegion);
    }
  });
  if (superRegionsContainingRegion.size != 1) {
    throw new ReferenceError(
      "The region " + region + " is not in exactly one super region"
    );
  }
  return superRegionsContainingRegion.values().next().value;
};

export const getSuperRegionFromCountry = (country: Country) => {
  return getSuperRegionFromRegion(getRegionFromCountry(country));
};
