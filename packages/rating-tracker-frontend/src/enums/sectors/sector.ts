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

const industryGroupsInSectors = new Map<Sector, Set<IndustryGroup>>();

industryGroupsInSectors.set(
  Sector.BasicMaterials,
  new Set<IndustryGroup>([
    IndustryGroup.Agriculture,
    IndustryGroup.BuildingMaterials,
    IndustryGroup.Chemicals,
    IndustryGroup.ForestProducts,
    IndustryGroup.MetalsMining,
    IndustryGroup.Steel,
  ])
);

industryGroupsInSectors.set(
  Sector.ConsumerCyclical,
  new Set<IndustryGroup>([
    IndustryGroup.VehiclesParts,
    IndustryGroup.FurnishingsFixturesAppliance,
    IndustryGroup.HomebuildingConstruction,
    IndustryGroup.ManufacturingApparelAccessories,
    IndustryGroup.PackagingContainers,
    IndustryGroup.PersonalServices,
    IndustryGroup.Restaurants,
    IndustryGroup.RetailCyclical,
    IndustryGroup.TravelLeisure,
  ])
);

industryGroupsInSectors.set(
  Sector.FinancialServices,
  new Set<IndustryGroup>([
    IndustryGroup.AssetManagement,
    IndustryGroup.Banks,
    IndustryGroup.CapitalMarkets,
    IndustryGroup.Insurance,
    IndustryGroup.DiversifiedFinancialServices,
    IndustryGroup.CreditServices,
  ])
);

industryGroupsInSectors.set(
  Sector.RealEstate,
  new Set<IndustryGroup>([IndustryGroup.RealEstate, IndustryGroup.REITs])
);

industryGroupsInSectors.set(
  Sector.ConsumerDefensive,
  new Set<IndustryGroup>([
    IndustryGroup.BeveragesAlcoholic,
    IndustryGroup.BeveragesNonAlcoholic,
    IndustryGroup.ConsumerPackagedGoods,
    IndustryGroup.Education,
    IndustryGroup.RetailDefensive,
    IndustryGroup.TobaccoProducts,
  ])
);

industryGroupsInSectors.set(
  Sector.HealthCare,
  new Set<IndustryGroup>([
    IndustryGroup.Biotechnology,
    IndustryGroup.DrugManufacturers,
    IndustryGroup.HealthcarePlans,
    IndustryGroup.HealthcareProvidersServices,
    IndustryGroup.MedicalDevicesInstruments,
    IndustryGroup.MedicalDiagnosticsResearch,
    IndustryGroup.MedicalDistribution,
  ])
);

industryGroupsInSectors.set(
  Sector.Utilities,
  new Set<IndustryGroup>([
    IndustryGroup.UtilitiesIndependentPowerProducers,
    IndustryGroup.UtilitiesRegulated,
  ])
);

industryGroupsInSectors.set(
  Sector.CommunicationServices,
  new Set<IndustryGroup>([
    IndustryGroup.TelecommunicationServices,
    IndustryGroup.MediaDiversified,
    IndustryGroup.InteractiveMedia,
  ])
);

industryGroupsInSectors.set(
  Sector.Energy,
  new Set<IndustryGroup>([
    IndustryGroup.OilGas,
    IndustryGroup.OtherEnergySources,
  ])
);

industryGroupsInSectors.set(
  Sector.Industrials,
  new Set<IndustryGroup>([
    IndustryGroup.AerospaceDefense,
    IndustryGroup.BusinessServices,
    IndustryGroup.Conglomerates,
    IndustryGroup.Construction,
    IndustryGroup.FarmHeavyConstructionMachinery,
    IndustryGroup.IndustrialDistribution,
    IndustryGroup.IndustrialProducts,
    IndustryGroup.Transportation,
    IndustryGroup.WasteManagement,
  ])
);

industryGroupsInSectors.set(
  Sector.Technology,
  new Set<IndustryGroup>([
    IndustryGroup.Software,
    IndustryGroup.Hardware,
    IndustryGroup.Semiconductors,
  ])
);

export const getSectorFromIndustryGroup = (industryGroup: IndustryGroup) => {
  const sectorsContainingIndustryGroup = new Set<Sector>();
  industryGroupsInSectors.forEach((industryGroupSet, sector) => {
    if (industryGroupSet.has(industryGroup)) {
      sectorsContainingIndustryGroup.add(sector);
    }
  });
  if (sectorsContainingIndustryGroup.size != 1) {
    throw new ReferenceError(
      "The industry group " + industryGroup + " is not in exactly one sector"
    );
  }
  return sectorsContainingIndustryGroup.values().next().value;
};

export const getSectorFromIndustry = (industry: Industry) => {
  return getSectorFromIndustryGroup(getGroupFromIndustry(industry));
};

export const getSectorKey = (sector: Sector) => {
  return Object.keys(Sector)[Object.values(Sector).indexOf(sector)];
};
