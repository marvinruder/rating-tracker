import { useTheme } from "@mui/material";
import { Sector, sectorArray, SuperSector } from "../../types";

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

export const getColor = (superSector: SuperSector) => {
  const theme = useTheme();
  switch (superSector) {
    case "Cyclical":
      return theme.colors.sector.cyclical;
    case "Defensive":
      return theme.colors.sector.defensive;
    case "Sensitive":
      return theme.colors.sector.sensitive;
  }
};

export const getSectorsInSuperSector = (superSector: SuperSector): Sector[] => {
  return sectorArray.filter(
    (sector) => superSectorOfSector[sector] == superSector
  );
};
