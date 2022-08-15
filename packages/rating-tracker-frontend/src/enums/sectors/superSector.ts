import { Industry } from "./industry";
import { getGroupFromIndustry } from "./industryGroup";
import { getSectorFromIndustryGroup, Sector } from "./sector";

export enum SuperSector {
  Cyclical = "Cyclical",
  Defensive = "Defensive",
  Sensitive = "Sensitive",
}

const sectorsInSuperSectors = new Map<SuperSector, Set<Sector>>();

sectorsInSuperSectors.set(
  SuperSector.Cyclical,
  new Set<Sector>([
    Sector.BasicMaterials,
    Sector.ConsumerCyclical,
    Sector.FinancialServices,
    Sector.RealEstate,
  ])
);

sectorsInSuperSectors.set(
  SuperSector.Defensive,
  new Set<Sector>([
    Sector.ConsumerDefensive,
    Sector.HealthCare,
    Sector.Utilities,
  ])
);

sectorsInSuperSectors.set(
  SuperSector.Sensitive,
  new Set<Sector>([
    Sector.CommunicationServices,
    Sector.Energy,
    Sector.Industrials,
    Sector.Technology,
  ])
);

export const getSuperSectorFromSector = (sector: Sector) => {
  const superSectorsContainingSector = new Set<SuperSector>();
  sectorsInSuperSectors.forEach((sectorSet, superSector) => {
    if (sectorSet.has(sector)) {
      superSectorsContainingSector.add(superSector);
    }
  });
  if (superSectorsContainingSector.size != 1) {
    throw new ReferenceError(
      "The sector " + sector + " is not in exactly one super sector"
    );
  }
  return superSectorsContainingSector.values().next().value;
};

export const getSuperSectorFromIndustry = (industry: Industry) => {
  return getSuperSectorFromSector(
    getSectorFromIndustryGroup(getGroupFromIndustry(industry))
  );
};

export const getSuperSectorKey = (superSector: SuperSector) => {
  return Object.keys(SuperSector)[
    Object.values(SuperSector).indexOf(superSector)
  ];
};
