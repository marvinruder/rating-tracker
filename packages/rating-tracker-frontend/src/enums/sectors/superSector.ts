import { useTheme } from "@mui/material";
import { Industry } from "./industry";
import { getGroupFromIndustry } from "./industryGroup";
import { getSectorFromIndustryGroup, Sector } from "./sector";

export enum SuperSector {
  Cyclical = "Cyclical",
  Defensive = "Defensive",
  Sensitive = "Sensitive",
}

const sectorsInSuperSectors = new Map<SuperSector, Sector[]>();

sectorsInSuperSectors.set(SuperSector.Cyclical, [
  Sector.BasicMaterials,
  Sector.ConsumerCyclical,
  Sector.FinancialServices,
  Sector.RealEstate,
]);

sectorsInSuperSectors.set(SuperSector.Defensive, [
  Sector.ConsumerDefensive,
  Sector.HealthCare,
  Sector.Utilities,
]);

sectorsInSuperSectors.set(SuperSector.Sensitive, [
  Sector.CommunicationServices,
  Sector.Energy,
  Sector.Industrials,
  Sector.Technology,
]);

export const getSuperSectorFromSector = (sector: Sector) => {
  const superSectorsContainingSector: SuperSector[] = [];
  sectorsInSuperSectors.forEach((sectorSet, superSector) => {
    if (sectorSet.includes(sector)) {
      superSectorsContainingSector.push(superSector);
    }
  });
  if (superSectorsContainingSector.length != 1) {
    throw new ReferenceError(
      "The sector " + sector + " is not in exactly one super sector"
    );
  }
  return superSectorsContainingSector[0];
};

export const getSuperSectorFromIndustry = (industry: Industry) => {
  return getSuperSectorFromSector(
    getSectorFromIndustryGroup(getGroupFromIndustry(industry))
  );
};

export const getSectorsInSuperSector = (superSector: SuperSector) => {
  return sectorsInSuperSectors.get(superSector);
};

export const getColor = (superSector: SuperSector) => {
  const theme = useTheme();
  switch (superSector) {
    case SuperSector.Cyclical:
      return theme.colors.sector.cyclical;
    case SuperSector.Defensive:
      return theme.colors.sector.defensive;
    case SuperSector.Sensitive:
      return theme.colors.sector.sensitive;
  }
};
