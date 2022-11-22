import { IndustryGroup, industryGroupArray } from "./IndustryGroup.js";

export const sectorArray = [
  "BasicMaterials",
  "ConsumerCyclical",
  "FinancialServices",
  "RealEstate",
  "ConsumerDefensive",
  "HealthCare",
  "Utilities",
  "CommunicationServices",
  "Energy",
  "Industrials",
  "Technology",
] as const;

export type Sector = typeof sectorArray[number];

export function isSector(s: string): s is Sector {
  return sectorArray.includes(s as Sector);
}

export const sectorName: Record<Sector, string> = {
  BasicMaterials: "Basic Materials",
  ConsumerCyclical: "Consumer Cyclical",
  FinancialServices: "Financial Services",
  RealEstate: "Real Estate",
  ConsumerDefensive: "Consumer Defensive",
  HealthCare: "Health Care",
  Utilities: "Utilities",
  CommunicationServices: "Communication Services",
  Energy: "Energy",
  Industrials: "Industrials",
  Technology: "Technology",
};

export const sectorOfIndustryGroup: Record<IndustryGroup, Sector> = {
  Agriculture: "BasicMaterials",
  BuildingMaterials: "BasicMaterials",
  Chemicals: "BasicMaterials",
  ForestProducts: "BasicMaterials",
  MetalsMining: "BasicMaterials",
  Steel: "BasicMaterials",
  VehiclesParts: "ConsumerCyclical",
  FurnishingsFixturesAppliance: "ConsumerCyclical",
  HomebuildingConstruction: "ConsumerCyclical",
  ManufacturingApparelAccessories: "ConsumerCyclical",
  PackagingContainers: "ConsumerCyclical",
  PersonalServices: "ConsumerCyclical",
  Restaurants: "ConsumerCyclical",
  RetailCyclical: "ConsumerCyclical",
  TravelLeisure: "ConsumerCyclical",
  AssetManagement: "FinancialServices",
  Banks: "FinancialServices",
  CapitalMarkets: "FinancialServices",
  Insurance: "FinancialServices",
  DiversifiedFinancialServices: "FinancialServices",
  CreditServices: "FinancialServices",
  RealEstate: "RealEstate",
  REITs: "RealEstate",
  BeveragesAlcoholic: "ConsumerDefensive",
  BeveragesNonAlcoholic: "ConsumerDefensive",
  ConsumerPackagedGoods: "ConsumerDefensive",
  Education: "ConsumerDefensive",
  RetailDefensive: "ConsumerDefensive",
  TobaccoProducts: "ConsumerDefensive",
  Biotechnology: "HealthCare",
  DrugManufacturers: "HealthCare",
  HealthcarePlans: "HealthCare",
  HealthcareProvidersServices: "HealthCare",
  MedicalDevicesInstruments: "HealthCare",
  MedicalDiagnosticsResearch: "HealthCare",
  MedicalDistribution: "HealthCare",
  UtilitiesIndependentPowerProducers: "Utilities",
  UtilitiesRegulated: "Utilities",
  TelecommunicationServices: "CommunicationServices",
  MediaDiversified: "CommunicationServices",
  InteractiveMedia: "CommunicationServices",
  OilGas: "Energy",
  OtherEnergySources: "Energy",
  AerospaceDefense: "Industrials",
  BusinessServices: "Industrials",
  Conglomerates: "Industrials",
  Construction: "Industrials",
  FarmHeavyConstructionMachinery: "Industrials",
  IndustrialDistribution: "Industrials",
  IndustrialProducts: "Industrials",
  Transportation: "Industrials",
  WasteManagement: "Industrials",
  Software: "Technology",
  Hardware: "Technology",
  Semiconductors: "Technology",
};

export const getIndustryGroupsInSector = (sector: Sector): IndustryGroup[] => {
  return industryGroupArray.filter(
    (industryGroup) => sectorOfIndustryGroup[industryGroup] == sector
  );
};
