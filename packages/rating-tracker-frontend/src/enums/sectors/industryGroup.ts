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

const industriesInGroups = new Map<IndustryGroup, Set<Industry>>();

industriesInGroups.set(
  IndustryGroup.Agriculture,
  new Set<Industry>([Industry.AgriculturalInputs])
);

industriesInGroups.set(
  IndustryGroup.BuildingMaterials,
  new Set<Industry>([Industry.BuildingMaterials])
);

industriesInGroups.set(
  IndustryGroup.Chemicals,
  new Set<Industry>([Industry.Chemicals, Industry.SpecialtyChemicals])
);

industriesInGroups.set(
  IndustryGroup.ForestProducts,
  new Set<Industry>([Industry.LumberWoodProduction, Industry.PaperProducts])
);

industriesInGroups.set(
  IndustryGroup.MetalsMining,
  new Set<Industry>([
    Industry.Aluminum,
    Industry.Copper,
    Industry.OtherIndustrialMetalsMining,
    Industry.Gold,
    Industry.Silver,
    Industry.OtherPreciousMetalsMining,
  ])
);

industriesInGroups.set(
  IndustryGroup.Steel,
  new Set<Industry>([Industry.CokingCoal, Industry.Steel])
);

industriesInGroups.set(
  IndustryGroup.VehiclesParts,
  new Set<Industry>([
    Industry.AutoTruckDealerships,
    Industry.AutoManufacturers,
    Industry.AutoParts,
    Industry.RecreationalVehicles,
  ])
);

industriesInGroups.set(
  IndustryGroup.FurnishingsFixturesAppliance,
  new Set<Industry>([Industry.FurnishingsFixturesAppliances])
);

industriesInGroups.set(
  IndustryGroup.HomebuildingConstruction,
  new Set<Industry>([Industry.ResidentialConstruction])
);

industriesInGroups.set(
  IndustryGroup.ManufacturingApparelAccessories,
  new Set<Industry>([
    Industry.TextileManufacturing,
    Industry.ApparelManufacturing,
    Industry.FootwearAccessories,
  ])
);

industriesInGroups.set(
  IndustryGroup.PackagingContainers,
  new Set<Industry>([Industry.PackagingContainers])
);

industriesInGroups.set(
  IndustryGroup.PersonalServices,
  new Set<Industry>([Industry.PersonalServices])
);

industriesInGroups.set(
  IndustryGroup.Restaurants,
  new Set<Industry>([Industry.Restaurants])
);

industriesInGroups.set(
  IndustryGroup.RetailCyclical,
  new Set<Industry>([
    Industry.ApparelRetail,
    Industry.DepartmentStores,
    Industry.HomeImprovementRetail,
    Industry.LuxuryGoods,
    Industry.InternetRetail,
    Industry.SpecialtyRetail,
  ])
);

industriesInGroups.set(
  IndustryGroup.TravelLeisure,
  new Set<Industry>([
    Industry.Gambling,
    Industry.Leisure,
    Industry.Lodging,
    Industry.ResortsCasinos,
    Industry.TravelServices,
  ])
);

industriesInGroups.set(
  IndustryGroup.AssetManagement,
  new Set<Industry>([Industry.AssetManagement])
);

industriesInGroups.set(
  IndustryGroup.Banks,
  new Set<Industry>([
    Industry.BanksDiversified,
    Industry.BanksRegional,
    Industry.MortgageFinance,
  ])
);

industriesInGroups.set(
  IndustryGroup.CapitalMarkets,
  new Set<Industry>([
    Industry.CapitalMarkets,
    Industry.FinancialDataStockExchanges,
  ])
);

industriesInGroups.set(
  IndustryGroup.Insurance,
  new Set<Industry>([
    Industry.InsuranceLife,
    Industry.InsurancePropertyCasualty,
    Industry.InsuranceReinsurance,
    Industry.InsuranceSpecialty,
    Industry.InsuranceBrokers,
    Industry.InsuranceDiversified,
  ])
);

industriesInGroups.set(
  IndustryGroup.DiversifiedFinancialServices,
  new Set<Industry>([Industry.ShellCompanies, Industry.FinancialConglomerates])
);

industriesInGroups.set(
  IndustryGroup.CreditServices,
  new Set<Industry>([Industry.CreditServices])
);

industriesInGroups.set(
  IndustryGroup.RealEstate,
  new Set<Industry>([
    Industry.RealEstateDevelopment,
    Industry.RealEstateServices,
    Industry.RealEstateDiversified,
  ])
);

industriesInGroups.set(
  IndustryGroup.REITs,
  new Set<Industry>([
    Industry.REITHealthcareFacilities,
    Industry.REITHotelMotel,
    Industry.REITIndustrial,
    Industry.REITOffice,
    Industry.REITResidential,
    Industry.REITRetail,
    Industry.REITMortgage,
    Industry.REITSpecialty,
    Industry.REITDiversified,
  ])
);

industriesInGroups.set(
  IndustryGroup.BeveragesAlcoholic,
  new Set<Industry>([
    Industry.BeveragesBrewers,
    Industry.BeveragesWineriesDistilleries,
  ])
);

industriesInGroups.set(
  IndustryGroup.BeveragesNonAlcoholic,
  new Set<Industry>([Industry.BeveragesNonAlcoholic])
);

industriesInGroups.set(
  IndustryGroup.ConsumerPackagedGoods,
  new Set<Industry>([
    Industry.Confectioners,
    Industry.FarmProducts,
    Industry.HouseholdPersonalProducts,
    Industry.PackagedFoods,
  ])
);

industriesInGroups.set(
  IndustryGroup.Education,
  new Set<Industry>([Industry.EducationTrainingServices])
);

industriesInGroups.set(
  IndustryGroup.RetailDefensive,
  new Set<Industry>([
    Industry.DiscountStores,
    Industry.FoodDistribution,
    Industry.GroceryStores,
  ])
);

industriesInGroups.set(
  IndustryGroup.TobaccoProducts,
  new Set<Industry>([Industry.Tobacco])
);

industriesInGroups.set(
  IndustryGroup.Biotechnology,
  new Set<Industry>([Industry.Biotechnology])
);

industriesInGroups.set(
  IndustryGroup.DrugManufacturers,
  new Set<Industry>([
    Industry.DrugManufacturersGeneral,
    Industry.DrugManufacturersSpecialtyGeneric,
  ])
);

industriesInGroups.set(
  IndustryGroup.HealthcarePlans,
  new Set<Industry>([Industry.HealthcarePlans])
);

industriesInGroups.set(
  IndustryGroup.HealthcareProvidersServices,
  new Set<Industry>([
    Industry.MedicalCareFacilities,
    Industry.PharmaceuticalRetailers,
    Industry.HealthInformationServices,
  ])
);

industriesInGroups.set(
  IndustryGroup.MedicalDevicesInstruments,
  new Set<Industry>([
    Industry.MedicalDevices,
    Industry.MedicalInstrumentsSupplies,
  ])
);

industriesInGroups.set(
  IndustryGroup.MedicalDiagnosticsResearch,
  new Set<Industry>([Industry.DiagnosticsResearch])
);

industriesInGroups.set(
  IndustryGroup.MedicalDistribution,
  new Set<Industry>([Industry.MedicalDistribution])
);

industriesInGroups.set(
  IndustryGroup.UtilitiesIndependentPowerProducers,
  new Set<Industry>([
    Industry.UtilitiesIndependentPowerProducers,
    Industry.UtilitiesRenewable,
  ])
);

industriesInGroups.set(
  IndustryGroup.UtilitiesRegulated,
  new Set<Industry>([
    Industry.UtilitiesRegulatedWater,
    Industry.UtilitiesRegulatedElectric,
    Industry.UtilitiesRegulatedGas,
    Industry.UtilitiesDiversified,
  ])
);

industriesInGroups.set(
  IndustryGroup.TelecommunicationServices,
  new Set<Industry>([Industry.TelecomServices])
);

industriesInGroups.set(
  IndustryGroup.MediaDiversified,
  new Set<Industry>([
    Industry.AdvertisingAgencies,
    Industry.Publishing,
    Industry.Broadcasting,
    Industry.Entertainment,
  ])
);

industriesInGroups.set(
  IndustryGroup.InteractiveMedia,
  new Set<Industry>([
    Industry.InternetContentInformation,
    Industry.ElectronicGamingMultimedia,
  ])
);

industriesInGroups.set(
  IndustryGroup.OilGas,
  new Set<Industry>([
    Industry.OilGasDrilling,
    Industry.OilGasEP,
    Industry.OilGasIntegrated,
    Industry.OilGasMidstream,
    Industry.OilGasRefiningMarketing,
    Industry.OilGasEquipmentServices,
  ])
);

industriesInGroups.set(
  IndustryGroup.OtherEnergySources,
  new Set<Industry>([Industry.ThermalCoal, Industry.Uranium])
);

industriesInGroups.set(
  IndustryGroup.AerospaceDefense,
  new Set<Industry>([Industry.AerospaceDefense])
);

industriesInGroups.set(
  IndustryGroup.BusinessServices,
  new Set<Industry>([
    Industry.SpecialtyBusinessServices,
    Industry.ConsultingServices,
    Industry.RentalLeasingServices,
    Industry.SecurityProtectionServices,
    Industry.StaffingEmploymentServices,
  ])
);

industriesInGroups.set(
  IndustryGroup.Conglomerates,
  new Set<Industry>([Industry.Conglomerates])
);

industriesInGroups.set(
  IndustryGroup.Construction,
  new Set<Industry>([
    Industry.EngineeringConstruction,
    Industry.InfrastructureOperations,
    Industry.BuildingProductsEquipment,
  ])
);

industriesInGroups.set(
  IndustryGroup.FarmHeavyConstructionMachinery,
  new Set<Industry>([Industry.FarmHeavyConstructionMachinery])
);

industriesInGroups.set(
  IndustryGroup.IndustrialDistribution,
  new Set<Industry>([Industry.IndustrialDistribution])
);

industriesInGroups.set(
  IndustryGroup.IndustrialProducts,
  new Set<Industry>([
    Industry.BusinessEquipmentSupplies,
    Industry.SpecialtyIndustrialMachinery,
    Industry.MetalFabrication,
    Industry.PollutionTreatmentControls,
    Industry.ToolsAccessories,
    Industry.ElectricalEquipmentParts,
  ])
);

industriesInGroups.set(
  IndustryGroup.Transportation,
  new Set<Industry>([
    Industry.AirportsAirServices,
    Industry.Airlines,
    Industry.Railroads,
    Industry.MarineShipping,
    Industry.Trucking,
    Industry.IntegratedFreightLogistics,
  ])
);

industriesInGroups.set(
  IndustryGroup.WasteManagement,
  new Set<Industry>([Industry.WasteManagement])
);

industriesInGroups.set(
  IndustryGroup.Software,
  new Set<Industry>([
    Industry.InformationTechnologyServices,
    Industry.SoftwareApplication,
    Industry.SoftwareInfrastructure,
  ])
);

industriesInGroups.set(
  IndustryGroup.Hardware,
  new Set<Industry>([
    Industry.CommunicationEquipment,
    Industry.ComputerHardware,
    Industry.ConsumerElectronics,
    Industry.ElectronicComponents,
    Industry.ElectronicsComputerDistribution,
    Industry.ScientificTechnicalInstruments,
  ])
);

industriesInGroups.set(
  IndustryGroup.Semiconductors,
  new Set<Industry>([
    Industry.SemiconductorEquipmentMaterials,
    Industry.Semiconductors,
    Industry.Solar,
  ])
);

export const getGroupFromIndustry = (industry: Industry) => {
  const industryGroupContainingIndustry = new Set<IndustryGroup>();
  industriesInGroups.forEach((industrySet, IndustryGroup) => {
    if (industrySet.has(industry)) {
      industryGroupContainingIndustry.add(IndustryGroup);
    }
  });
  if (industryGroupContainingIndustry.size != 1) {
    throw new ReferenceError(
      "The industry " + industry + " is not in exactly one industry group"
    );
  }
  return industryGroupContainingIndustry.values().next().value;
};
