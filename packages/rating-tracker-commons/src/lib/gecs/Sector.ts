/* eslint-disable max-len */
import { IndustryGroup, industryGroupArray } from "./IndustryGroup.js";

/**
 * An array of sectors in the Morningstar Global Equity Classification Structure.
 */
export const sectorArray = [
  "BasicMaterials",
  "ConsumerCyclical",
  "FinancialServices",
  "RealEstate",
  "ConsumerDefensive",
  "Healthcare",
  "Utilities",
  "CommunicationServices",
  "Energy",
  "Industrials",
  "Technology",
] as const;

/**
 * A sector in the Morningstar Global Equity Classification Structure.
 */
export type Sector = (typeof sectorArray)[number];

/**
 * Checks if a string is a valid sector.
 * @param {string} s The string to check.
 * @returns {boolean} True if the string is a valid sector.
 */
export function isSector(s: string): s is Sector {
  return sectorArray.includes(s as Sector);
}

/**
 * A record of sector names for each sector.
 */
export const sectorName: Record<Sector, string> = {
  BasicMaterials: "Basic Materials",
  ConsumerCyclical: "Consumer Cyclical",
  FinancialServices: "Financial Services",
  RealEstate: "Real Estate",
  ConsumerDefensive: "Consumer Defensive",
  Healthcare: "Healthcare",
  Utilities: "Utilities",
  CommunicationServices: "Communication Services",
  Energy: "Energy",
  Industrials: "Industrials",
  Technology: "Technology",
};

/**
 * A record of descriptions for each sector.
 */
export const sectorDescription: Record<Sector, string> = {
  BasicMaterials:
    "Companies that manufacture chemicals, building materials, and paper products. This sector also includes companies engaged in commodities exploration and processing.",
  ConsumerCyclical:
    "This sector includes retail stores, auto and auto-parts manufacturers, restaurants, lodging facilities, specialty retail and travel companies.",
  FinancialServices:
    "Companies that provide financial services include banks, savings and loans, asset management companies, credit services, investment brokerage firms, and insurance companies.",
  RealEstate: "This sector includes companies that develop, acquire, manage, and operate real estate properties.",
  ConsumerDefensive:
    "Companies that manufacture food, beverages, household and personal products, packaging, or tobacco. Also includes companies that provide services such as education and training services.",
  Healthcare:
    "This sector includes biotechnology, pharmaceuticals, research services, home healthcare, hospitals, long-term-care facilities, and medical equipment and supplies. Also include pharmaceutical retailers and companies which provide health information services.",
  Utilities: "Electric, gas, and water utilities.",
  CommunicationServices:
    "Companies that provide communication services using fixed-line networks or those that provide wireless access and services. Also includes companies that provide advertising & marketing services, entertainment content and services, as well as interactive media and content provider over internet or through software.",
  Energy:
    "Companies that produce or refine oil and gas, oilfield-services and equipment companies, and pipeline operators. This sector also includes companies that mine thermal coal and uranium.",
  Industrials:
    "Companies that manufacture machinery, hand-held tools, and industrial products. This sector also includes aerospace and defense firms as well as companies engaged in transportation services.",
  Technology:
    "Companies engaged in the design, development, and support of computer operating systems and applications. This sector also includes companies that make computer equipment, data storage products, networking products, semiconductors, and components.",
};

/**
 * A record associating each industry group with its sector.
 */
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
  Biotechnology: "Healthcare",
  DrugManufacturers: "Healthcare",
  HealthcarePlans: "Healthcare",
  HealthcareProvidersServices: "Healthcare",
  MedicalDevicesInstruments: "Healthcare",
  MedicalDiagnosticsResearch: "Healthcare",
  MedicalDistribution: "Healthcare",
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

/**
 * Returns an array of all industry groups in a sector.
 * @param {Sector} sector The sector to get industry groups for.
 * @returns {IndustryGroup[]} The array of industry groups in the sector.
 */
export const getIndustryGroupsInSector = (sector: Sector): IndustryGroup[] => {
  return industryGroupArray.filter((industryGroup) => sectorOfIndustryGroup[industryGroup] == sector);
};
