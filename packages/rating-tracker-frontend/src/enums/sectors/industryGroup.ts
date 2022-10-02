import { Industry } from "./industry";

export enum IndustryGroup {
  Agriculture = "Agriculture",
  BuildingMaterials = "Building Materials",
  Chemicals = "Chemicals",
  ForestProducts = "Forest Products",
  MetalsMining = "Metals & Mining",
  Steel = "Steel",
  VehiclesParts = "Vehicles & Parts",
  FurnishingsFixturesAppliance = "Furnishings, Fixtures, & Appliance",
  HomebuildingConstruction = "Homebuilding & Construction",
  ManufacturingApparelAccessories = "Manufacturing – Apparel & Accessories",
  PackagingContainers = "Packaging & Containers",
  PersonalServices = "Personal Services",
  Restaurants = "Restaurants",
  RetailCyclical = "Retail – Cyclical",
  TravelLeisure = "Travel & Leisure",
  AssetManagement = "Asset Management",
  Banks = "Banks",
  CapitalMarkets = "Capital Markets",
  Insurance = "Insurance",
  DiversifiedFinancialServices = "Diversified Financial Services",
  CreditServices = "Credit Services",
  RealEstate = "Real Estate",
  REITs = "REITs",
  BeveragesAlcoholic = "Beverages – Alcoholic",
  BeveragesNonAlcoholic = "Beverages – Non-Alcoholic",
  ConsumerPackagedGoods = "Consumer Packaged Goods",
  Education = "Education",
  RetailDefensive = "Retail – Defensive",
  TobaccoProducts = "Tobacco Products",
  Biotechnology = "Biotechnology",
  DrugManufacturers = "Drug Manufacturers",
  HealthcarePlans = "Healthcare Plans",
  HealthcareProvidersServices = "Health Care Providers & Services",
  MedicalDevicesInstruments = "Medical Devices & Instruments",
  MedicalDiagnosticsResearch = "Medical Diagnostics & Research",
  MedicalDistribution = "Medical Distribution",
  UtilitiesIndependentPowerProducers = "Utilities – Independent Power Producers",
  UtilitiesRegulated = "Utilities – Regulated",
  TelecommunicationServices = "Telecommunication Services",
  MediaDiversified = "Media – Diversified",
  InteractiveMedia = "Interactive Media",
  OilGas = "Oil & Gas",
  OtherEnergySources = "Other Energy Sources",
  AerospaceDefense = "Aerospace & Defense",
  BusinessServices = "Business Services",
  Conglomerates = "Conglomerates",
  Construction = "Construction",
  FarmHeavyConstructionMachinery = "Farm & Heavy Construction Machinery",
  IndustrialDistribution = "Industrial Distribution",
  IndustrialProducts = "Industrial Products",
  Transportation = "Transportation",
  WasteManagement = "Waste Management",
  Software = "Software",
  Hardware = "Hardware",
  Semiconductors = "Semiconductors",
}

const industriesInGroups = new Map<IndustryGroup, Industry[]>();

industriesInGroups.set(IndustryGroup.Agriculture, [
  Industry.AgriculturalInputs,
]);

industriesInGroups.set(IndustryGroup.BuildingMaterials, [
  Industry.BuildingMaterials,
]);

industriesInGroups.set(IndustryGroup.Chemicals, [
  Industry.Chemicals,
  Industry.SpecialtyChemicals,
]);

industriesInGroups.set(IndustryGroup.ForestProducts, [
  Industry.LumberWoodProduction,
  Industry.PaperProducts,
]);

industriesInGroups.set(IndustryGroup.MetalsMining, [
  Industry.Aluminum,
  Industry.Copper,
  Industry.OtherIndustrialMetalsMining,
  Industry.Gold,
  Industry.Silver,
  Industry.OtherPreciousMetalsMining,
]);

industriesInGroups.set(IndustryGroup.Steel, [
  Industry.CokingCoal,
  Industry.Steel,
]);

industriesInGroups.set(IndustryGroup.VehiclesParts, [
  Industry.AutoTruckDealerships,
  Industry.AutoManufacturers,
  Industry.AutoParts,
  Industry.RecreationalVehicles,
]);

industriesInGroups.set(IndustryGroup.FurnishingsFixturesAppliance, [
  Industry.FurnishingsFixturesAppliances,
]);

industriesInGroups.set(IndustryGroup.HomebuildingConstruction, [
  Industry.ResidentialConstruction,
]);

industriesInGroups.set(IndustryGroup.ManufacturingApparelAccessories, [
  Industry.TextileManufacturing,
  Industry.ApparelManufacturing,
  Industry.FootwearAccessories,
]);

industriesInGroups.set(IndustryGroup.PackagingContainers, [
  Industry.PackagingContainers,
]);

industriesInGroups.set(IndustryGroup.PersonalServices, [
  Industry.PersonalServices,
]);

industriesInGroups.set(IndustryGroup.Restaurants, [Industry.Restaurants]);

industriesInGroups.set(IndustryGroup.RetailCyclical, [
  Industry.ApparelRetail,
  Industry.DepartmentStores,
  Industry.HomeImprovementRetail,
  Industry.LuxuryGoods,
  Industry.InternetRetail,
  Industry.SpecialtyRetail,
]);

industriesInGroups.set(IndustryGroup.TravelLeisure, [
  Industry.Gambling,
  Industry.Leisure,
  Industry.Lodging,
  Industry.ResortsCasinos,
  Industry.TravelServices,
]);

industriesInGroups.set(IndustryGroup.AssetManagement, [
  Industry.AssetManagement,
]);

industriesInGroups.set(IndustryGroup.Banks, [
  Industry.BanksDiversified,
  Industry.BanksRegional,
  Industry.MortgageFinance,
]);

industriesInGroups.set(IndustryGroup.CapitalMarkets, [
  Industry.CapitalMarkets,
  Industry.FinancialDataStockExchanges,
]);

industriesInGroups.set(IndustryGroup.Insurance, [
  Industry.InsuranceLife,
  Industry.InsurancePropertyCasualty,
  Industry.InsuranceReinsurance,
  Industry.InsuranceSpecialty,
  Industry.InsuranceBrokers,
  Industry.InsuranceDiversified,
]);

industriesInGroups.set(IndustryGroup.DiversifiedFinancialServices, [
  Industry.ShellCompanies,
  Industry.FinancialConglomerates,
]);

industriesInGroups.set(IndustryGroup.CreditServices, [Industry.CreditServices]);

industriesInGroups.set(IndustryGroup.RealEstate, [
  Industry.RealEstateDevelopment,
  Industry.RealEstateServices,
  Industry.RealEstateDiversified,
]);

industriesInGroups.set(IndustryGroup.REITs, [
  Industry.REITHealthcareFacilities,
  Industry.REITHotelMotel,
  Industry.REITIndustrial,
  Industry.REITOffice,
  Industry.REITResidential,
  Industry.REITRetail,
  Industry.REITMortgage,
  Industry.REITSpecialty,
  Industry.REITDiversified,
]);

industriesInGroups.set(IndustryGroup.BeveragesAlcoholic, [
  Industry.BeveragesBrewers,
  Industry.BeveragesWineriesDistilleries,
]);

industriesInGroups.set(IndustryGroup.BeveragesNonAlcoholic, [
  Industry.BeveragesNonAlcoholic,
]);

industriesInGroups.set(IndustryGroup.ConsumerPackagedGoods, [
  Industry.Confectioners,
  Industry.FarmProducts,
  Industry.HouseholdPersonalProducts,
  Industry.PackagedFoods,
]);

industriesInGroups.set(IndustryGroup.Education, [
  Industry.EducationTrainingServices,
]);

industriesInGroups.set(IndustryGroup.RetailDefensive, [
  Industry.DiscountStores,
  Industry.FoodDistribution,
  Industry.GroceryStores,
]);

industriesInGroups.set(IndustryGroup.TobaccoProducts, [Industry.Tobacco]);

industriesInGroups.set(IndustryGroup.Biotechnology, [Industry.Biotechnology]);

industriesInGroups.set(IndustryGroup.DrugManufacturers, [
  Industry.DrugManufacturersGeneral,
  Industry.DrugManufacturersSpecialtyGeneric,
]);

industriesInGroups.set(IndustryGroup.HealthcarePlans, [
  Industry.HealthcarePlans,
]);

industriesInGroups.set(IndustryGroup.HealthcareProvidersServices, [
  Industry.MedicalCareFacilities,
  Industry.PharmaceuticalRetailers,
  Industry.HealthInformationServices,
]);

industriesInGroups.set(IndustryGroup.MedicalDevicesInstruments, [
  Industry.MedicalDevices,
  Industry.MedicalInstrumentsSupplies,
]);

industriesInGroups.set(IndustryGroup.MedicalDiagnosticsResearch, [
  Industry.DiagnosticsResearch,
]);

industriesInGroups.set(IndustryGroup.MedicalDistribution, [
  Industry.MedicalDistribution,
]);

industriesInGroups.set(IndustryGroup.UtilitiesIndependentPowerProducers, [
  Industry.UtilitiesIndependentPowerProducers,
  Industry.UtilitiesRenewable,
]);

industriesInGroups.set(IndustryGroup.UtilitiesRegulated, [
  Industry.UtilitiesRegulatedWater,
  Industry.UtilitiesRegulatedElectric,
  Industry.UtilitiesRegulatedGas,
  Industry.UtilitiesDiversified,
]);

industriesInGroups.set(IndustryGroup.TelecommunicationServices, [
  Industry.TelecomServices,
]);

industriesInGroups.set(IndustryGroup.MediaDiversified, [
  Industry.AdvertisingAgencies,
  Industry.Publishing,
  Industry.Broadcasting,
  Industry.Entertainment,
]);

industriesInGroups.set(IndustryGroup.InteractiveMedia, [
  Industry.InternetContentInformation,
  Industry.ElectronicGamingMultimedia,
]);

industriesInGroups.set(IndustryGroup.OilGas, [
  Industry.OilGasDrilling,
  Industry.OilGasEP,
  Industry.OilGasIntegrated,
  Industry.OilGasMidstream,
  Industry.OilGasRefiningMarketing,
  Industry.OilGasEquipmentServices,
]);

industriesInGroups.set(IndustryGroup.OtherEnergySources, [
  Industry.ThermalCoal,
  Industry.Uranium,
]);

industriesInGroups.set(IndustryGroup.AerospaceDefense, [
  Industry.AerospaceDefense,
]);

industriesInGroups.set(IndustryGroup.BusinessServices, [
  Industry.SpecialtyBusinessServices,
  Industry.ConsultingServices,
  Industry.RentalLeasingServices,
  Industry.SecurityProtectionServices,
  Industry.StaffingEmploymentServices,
]);

industriesInGroups.set(IndustryGroup.Conglomerates, [Industry.Conglomerates]);

industriesInGroups.set(IndustryGroup.Construction, [
  Industry.EngineeringConstruction,
  Industry.InfrastructureOperations,
  Industry.BuildingProductsEquipment,
]);

industriesInGroups.set(IndustryGroup.FarmHeavyConstructionMachinery, [
  Industry.FarmHeavyConstructionMachinery,
]);

industriesInGroups.set(IndustryGroup.IndustrialDistribution, [
  Industry.IndustrialDistribution,
]);

industriesInGroups.set(IndustryGroup.IndustrialProducts, [
  Industry.BusinessEquipmentSupplies,
  Industry.SpecialtyIndustrialMachinery,
  Industry.MetalFabrication,
  Industry.PollutionTreatmentControls,
  Industry.ToolsAccessories,
  Industry.ElectricalEquipmentParts,
]);

industriesInGroups.set(IndustryGroup.Transportation, [
  Industry.AirportsAirServices,
  Industry.Airlines,
  Industry.Railroads,
  Industry.MarineShipping,
  Industry.Trucking,
  Industry.IntegratedFreightLogistics,
]);

industriesInGroups.set(IndustryGroup.WasteManagement, [
  Industry.WasteManagement,
]);

industriesInGroups.set(IndustryGroup.Software, [
  Industry.InformationTechnologyServices,
  Industry.SoftwareApplication,
  Industry.SoftwareInfrastructure,
]);

industriesInGroups.set(IndustryGroup.Hardware, [
  Industry.CommunicationEquipment,
  Industry.ComputerHardware,
  Industry.ConsumerElectronics,
  Industry.ElectronicComponents,
  Industry.ElectronicsComputerDistribution,
  Industry.ScientificTechnicalInstruments,
]);

industriesInGroups.set(IndustryGroup.Semiconductors, [
  Industry.SemiconductorEquipmentMaterials,
  Industry.Semiconductors,
  Industry.Solar,
]);

export const getGroupFromIndustry = (industry: Industry) => {
  const industryGroupContainingIndustry: IndustryGroup[] = [];
  industriesInGroups.forEach((industrySet, IndustryGroup) => {
    if (industrySet.includes(industry)) {
      industryGroupContainingIndustry.push(IndustryGroup);
    }
  });
  if (industryGroupContainingIndustry.length != 1) {
    throw new ReferenceError(
      "The industry " + industry + " is not in exactly one industry group"
    );
  }
  return industryGroupContainingIndustry[0];
};

export const getIndustriesInGroup = (
  industryGroup: IndustryGroup
): Industry[] => {
  return industriesInGroups.get(industryGroup);
};
