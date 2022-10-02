import { Industry } from "./industry";
import { getGroupFromIndustry, IndustryGroup } from "./industryGroup";

export enum Sector {
  BasicMaterials = "Basic Materials",
  ConsumerCyclical = "Consumer Cyclical",
  FinancialServices = "Financial Services",
  RealEstate = "Real Estate",
  ConsumerDefensive = "Consumer Defensive",
  HealthCare = "Health Care",
  Utilities = "Utilities",
  CommunicationServices = "Communication Services",
  Energy = "Energy",
  Industrials = "Industrials",
  Technology = "Technology",
}

const industryGroupsInSectors = new Map<Sector, IndustryGroup[]>();

industryGroupsInSectors.set(Sector.BasicMaterials, [
  IndustryGroup.Agriculture,
  IndustryGroup.BuildingMaterials,
  IndustryGroup.Chemicals,
  IndustryGroup.ForestProducts,
  IndustryGroup.MetalsMining,
  IndustryGroup.Steel,
]);

industryGroupsInSectors.set(Sector.ConsumerCyclical, [
  IndustryGroup.VehiclesParts,
  IndustryGroup.FurnishingsFixturesAppliance,
  IndustryGroup.HomebuildingConstruction,
  IndustryGroup.ManufacturingApparelAccessories,
  IndustryGroup.PackagingContainers,
  IndustryGroup.PersonalServices,
  IndustryGroup.Restaurants,
  IndustryGroup.RetailCyclical,
  IndustryGroup.TravelLeisure,
]);

industryGroupsInSectors.set(Sector.FinancialServices, [
  IndustryGroup.AssetManagement,
  IndustryGroup.Banks,
  IndustryGroup.CapitalMarkets,
  IndustryGroup.Insurance,
  IndustryGroup.DiversifiedFinancialServices,
  IndustryGroup.CreditServices,
]);

industryGroupsInSectors.set(Sector.RealEstate, [
  IndustryGroup.RealEstate,
  IndustryGroup.REITs,
]);

industryGroupsInSectors.set(Sector.ConsumerDefensive, [
  IndustryGroup.BeveragesAlcoholic,
  IndustryGroup.BeveragesNonAlcoholic,
  IndustryGroup.ConsumerPackagedGoods,
  IndustryGroup.Education,
  IndustryGroup.RetailDefensive,
  IndustryGroup.TobaccoProducts,
]);

industryGroupsInSectors.set(Sector.HealthCare, [
  IndustryGroup.Biotechnology,
  IndustryGroup.DrugManufacturers,
  IndustryGroup.HealthcarePlans,
  IndustryGroup.HealthcareProvidersServices,
  IndustryGroup.MedicalDevicesInstruments,
  IndustryGroup.MedicalDiagnosticsResearch,
  IndustryGroup.MedicalDistribution,
]);

industryGroupsInSectors.set(Sector.Utilities, [
  IndustryGroup.UtilitiesIndependentPowerProducers,
  IndustryGroup.UtilitiesRegulated,
]);

industryGroupsInSectors.set(Sector.CommunicationServices, [
  IndustryGroup.TelecommunicationServices,
  IndustryGroup.MediaDiversified,
  IndustryGroup.InteractiveMedia,
]);

industryGroupsInSectors.set(Sector.Energy, [
  IndustryGroup.OilGas,
  IndustryGroup.OtherEnergySources,
]);

industryGroupsInSectors.set(Sector.Industrials, [
  IndustryGroup.AerospaceDefense,
  IndustryGroup.BusinessServices,
  IndustryGroup.Conglomerates,
  IndustryGroup.Construction,
  IndustryGroup.FarmHeavyConstructionMachinery,
  IndustryGroup.IndustrialDistribution,
  IndustryGroup.IndustrialProducts,
  IndustryGroup.Transportation,
  IndustryGroup.WasteManagement,
]);

industryGroupsInSectors.set(Sector.Technology, [
  IndustryGroup.Software,
  IndustryGroup.Hardware,
  IndustryGroup.Semiconductors,
]);

export const getSectorFromIndustryGroup = (industryGroup: IndustryGroup) => {
  const sectorsContainingIndustryGroup: Sector[] = [];
  industryGroupsInSectors.forEach((industryGroupSet, sector) => {
    if (industryGroupSet.includes(industryGroup)) {
      sectorsContainingIndustryGroup.push(sector);
    }
  });
  if (sectorsContainingIndustryGroup.length != 1) {
    throw new ReferenceError(
      "The industry group " + industryGroup + " is not in exactly one sector"
    );
  }
  return sectorsContainingIndustryGroup[0];
};

export const getSectorFromIndustry = (industry: Industry) => {
  return getSectorFromIndustryGroup(getGroupFromIndustry(industry));
};

export const getIndustryGroupsInSector = (sector: Sector) => {
  return industryGroupsInSectors.get(sector);
};
