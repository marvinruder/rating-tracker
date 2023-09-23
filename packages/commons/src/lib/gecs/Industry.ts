/* eslint-disable max-len */
/**
 * An array of industries in the Morningstar Global Equity Classification Structure.
 */
export const industryArray = [
  "AgriculturalInputs",
  "BuildingMaterials",
  "Chemicals",
  "SpecialtyChemicals",
  "LumberWoodProduction",
  "PaperPaperProducts",
  "Aluminum",
  "Copper",
  "OtherIndustrialMetalsMining",
  "Gold",
  "Silver",
  "OtherPreciousMetalsMining",
  "CokingCoal",
  "Steel",
  "AutoTruckDealerships",
  "AutoManufacturers",
  "AutoParts",
  "RecreationalVehicles",
  "FurnishingsFixturesAppliances",
  "ResidentialConstruction",
  "TextileManufacturing",
  "ApparelManufacturing",
  "FootwearAccessories",
  "PackagingContainers",
  "PersonalServices",
  "Restaurants",
  "ApparelRetail",
  "DepartmentStores",
  "HomeImprovementRetail",
  "LuxuryGoods",
  "InternetRetail",
  "SpecialtyRetail",
  "Gambling",
  "Leisure",
  "Lodging",
  "ResortsCasinos",
  "TravelServices",
  "AssetManagement",
  "BanksDiversified",
  "BanksRegional",
  "MortgageFinance",
  "CapitalMarkets",
  "FinancialDataStockExchanges",
  "InsuranceLife",
  "InsurancePropertyCasualty",
  "InsuranceReinsurance",
  "InsuranceSpecialty",
  "InsuranceBrokers",
  "InsuranceDiversified",
  "ShellCompanies",
  "FinancialConglomerates",
  "CreditServices",
  "RealEstateDevelopment",
  "RealEstateServices",
  "RealEstateDiversified",
  "REITHealthcareFacilities",
  "REITHotelMotel",
  "REITIndustrial",
  "REITOffice",
  "REITResidential",
  "REITRetail",
  "REITMortgage",
  "REITSpecialty",
  "REITDiversified",
  "BeveragesBrewers",
  "BeveragesWineriesDistilleries",
  "BeveragesNonAlcoholic",
  "Confectioners",
  "FarmProducts",
  "HouseholdPersonalProducts",
  "PackagedFoods",
  "EducationTrainingServices",
  "DiscountStores",
  "FoodDistribution",
  "GroceryStores",
  "Tobacco",
  "Biotechnology",
  "DrugManufacturersGeneral",
  "DrugManufacturersSpecialtyGeneric",
  "HealthcarePlans",
  "MedicalCareFacilities",
  "PharmaceuticalRetailers",
  "HealthInformationServices",
  "MedicalDevices",
  "MedicalInstrumentsSupplies",
  "DiagnosticsResearch",
  "MedicalDistribution",
  "UtilitiesIndependentPowerProducers",
  "UtilitiesRenewable",
  "UtilitiesRegulatedWater",
  "UtilitiesRegulatedElectric",
  "UtilitiesRegulatedGas",
  "UtilitiesDiversified",
  "TelecomServices",
  "AdvertisingAgencies",
  "Publishing",
  "Broadcasting",
  "Entertainment",
  "InternetContentInformation",
  "ElectronicGamingMultimedia",
  "OilGasDrilling",
  "OilGasEP",
  "OilGasIntegrated",
  "OilGasMidstream",
  "OilGasRefiningMarketing",
  "OilGasEquipmentServices",
  "ThermalCoal",
  "Uranium",
  "AerospaceDefense",
  "SpecialtyBusinessServices",
  "ConsultingServices",
  "RentalLeasingServices",
  "SecurityProtectionServices",
  "StaffingEmploymentServices",
  "Conglomerates",
  "EngineeringConstruction",
  "InfrastructureOperations",
  "BuildingProductsEquipment",
  "FarmHeavyConstructionMachinery",
  "IndustrialDistribution",
  "BusinessEquipmentSupplies",
  "SpecialtyIndustrialMachinery",
  "MetalFabrication",
  "PollutionTreatmentControls",
  "ToolsAccessories",
  "ElectricalEquipmentParts",
  "AirportsAirServices",
  "Airlines",
  "Railroads",
  "MarineShipping",
  "Trucking",
  "IntegratedFreightLogistics",
  "WasteManagement",
  "InformationTechnologyServices",
  "SoftwareApplication",
  "SoftwareInfrastructure",
  "CommunicationEquipment",
  "ComputerHardware",
  "ConsumerElectronics",
  "ElectronicComponents",
  "ElectronicsComputerDistribution",
  "ScientificTechnicalInstruments",
  "SemiconductorEquipmentMaterials",
  "Semiconductors",
  "Solar",
] as const;

/**
 * An industry in the Morningstar Global Equity Classification Structure.
 */
export type Industry = (typeof industryArray)[number];

/**
 * Checks if a string is a valid industry.
 *
 * @param {string} s The string to check.
 * @returns {boolean} True if the string is a valid industry.
 */
export function isIndustry(s: string): s is Industry {
  return industryArray.includes(s as Industry);
}

/**
 * A record of industry names for each industry.
 */
export const industryName: Record<Industry, string> = {
  AgriculturalInputs: "Agricultural Inputs",
  BuildingMaterials: "Building Materials",
  Chemicals: "Chemicals",
  SpecialtyChemicals: "Specialty Chemicals",
  LumberWoodProduction: "Lumber & Wood Production",
  PaperPaperProducts: "Paper & Paper Products",
  Aluminum: "Aluminum",
  Copper: "Copper",
  OtherIndustrialMetalsMining: "Other Industrial Metals & Mining",
  Gold: "Gold",
  Silver: "Silver",
  OtherPreciousMetalsMining: "Other Precious Metals & Mining",
  CokingCoal: "Coking Coal",
  Steel: "Steel",
  AutoTruckDealerships: "Auto & Truck Dealerships",
  AutoManufacturers: "Auto Manufacturers",
  AutoParts: "Auto Parts",
  RecreationalVehicles: "Recreational Vehicles",
  FurnishingsFixturesAppliances: "Furnishings, Fixtures, & Appliances",
  ResidentialConstruction: "Residential Construction",
  TextileManufacturing: "Textile Manufacturing",
  ApparelManufacturing: "Apparel Manufacturing",
  FootwearAccessories: "Footwear & Accessories",
  PackagingContainers: "Packaging & Containers",
  PersonalServices: "Personal Services",
  Restaurants: "Restaurants",
  ApparelRetail: "Apparel Retail",
  DepartmentStores: "Department Stores",
  HomeImprovementRetail: "Home Improvement Retail",
  LuxuryGoods: "Luxury Goods",
  InternetRetail: "Internet Retail",
  SpecialtyRetail: "Specialty Retail",
  Gambling: "Gambling",
  Leisure: "Leisure",
  Lodging: "Lodging",
  ResortsCasinos: "Resorts & Casinos",
  TravelServices: "Travel Services",
  AssetManagement: "Asset Management",
  BanksDiversified: "Banks – Diversified",
  BanksRegional: "Banks – Regional",
  MortgageFinance: "Mortgage Finance",
  CapitalMarkets: "Capital Markets",
  FinancialDataStockExchanges: "Financial Data & Stock Exchanges",
  InsuranceLife: "Insurance – Life",
  InsurancePropertyCasualty: "Insurance – Property & Casualty",
  InsuranceReinsurance: "Insurance – Reinsurance",
  InsuranceSpecialty: "Insurance – Specialty",
  InsuranceBrokers: "Insurance – Brokers",
  InsuranceDiversified: "Insurance – Diversified",
  ShellCompanies: "Shell Companies",
  FinancialConglomerates: "Financial Conglomerates",
  CreditServices: "Credit Services",
  RealEstateDevelopment: "Real Estate – Development",
  RealEstateServices: "Real Estate Services",
  RealEstateDiversified: "Real Estate – Diversified",
  REITHealthcareFacilities: "REIT – Healthcare Facilities",
  REITHotelMotel: "REIT – Hotel & Motel",
  REITIndustrial: "REIT – Industrial",
  REITOffice: "REIT – Office",
  REITResidential: "REIT – Residential",
  REITRetail: "REIT – Retail",
  REITMortgage: "REIT – Mortgage",
  REITSpecialty: "REIT – Specialty",
  REITDiversified: "REIT – Diversified",
  BeveragesBrewers: "Beverages – Brewers",
  BeveragesWineriesDistilleries: "Beverages – Wineries & Distilleries",
  BeveragesNonAlcoholic: "Beverages – Non-Alcoholic",
  Confectioners: "Confectioners",
  FarmProducts: "Farm Products",
  HouseholdPersonalProducts: "Household & Personal Products",
  PackagedFoods: "Packaged Foods",
  EducationTrainingServices: "Education & Training Services",
  DiscountStores: "Discount Stores",
  FoodDistribution: "Food Distribution",
  GroceryStores: "Grocery Stores",
  Tobacco: "Tobacco",
  Biotechnology: "Biotechnology",
  DrugManufacturersGeneral: "Drug Manufacturers – General",
  DrugManufacturersSpecialtyGeneric: "Drug Manufacturers – Specialty & Generic",
  HealthcarePlans: "Healthcare Plans",
  MedicalCareFacilities: "Medical Care Facilities",
  PharmaceuticalRetailers: "Pharmaceutical Retailers",
  HealthInformationServices: "Health Information Services",
  MedicalDevices: "Medical Devices",
  MedicalInstrumentsSupplies: "Medical Instruments & Supplies",
  DiagnosticsResearch: "Diagnostics & Research",
  MedicalDistribution: "Medical Distribution",
  UtilitiesIndependentPowerProducers: "Utilities – Independent Power Producers",
  UtilitiesRenewable: "Utilities – Renewable",
  UtilitiesRegulatedWater: "Utilities – Regulated Water",
  UtilitiesRegulatedElectric: "Utilities – Regulated Electric",
  UtilitiesRegulatedGas: "Utilities – Regulated Gas",
  UtilitiesDiversified: "Utilities – Diversified",
  TelecomServices: "Telecom Services",
  AdvertisingAgencies: "Advertising Agencies",
  Publishing: "Publishing",
  Broadcasting: "Broadcasting",
  Entertainment: "Entertainment",
  InternetContentInformation: "Internet Content & Information",
  ElectronicGamingMultimedia: "Electronic Gaming & Multimedia",
  OilGasDrilling: "Oil & Gas Drilling",
  OilGasEP: "Oil & Gas E&P",
  OilGasIntegrated: "Oil & Gas Integrated",
  OilGasMidstream: "Oil & Gas Midstream",
  OilGasRefiningMarketing: "Oil & Gas Refining & Marketing",
  OilGasEquipmentServices: "Oil & Gas Equipment & Services",
  ThermalCoal: "Thermal Coal",
  Uranium: "Uranium",
  AerospaceDefense: "Aerospace & Defense",
  SpecialtyBusinessServices: "Specialty Business Services",
  ConsultingServices: "Consulting Services",
  RentalLeasingServices: "Rental & Leasing Services",
  SecurityProtectionServices: "Security & Protection Services",
  StaffingEmploymentServices: "Staffing & Employment Services",
  Conglomerates: "Conglomerates",
  EngineeringConstruction: "Engineering & Construction",
  InfrastructureOperations: "Infrastructure Operations",
  BuildingProductsEquipment: "Building Products & Equipment",
  FarmHeavyConstructionMachinery: "Farm & Heavy Construction Machinery",
  IndustrialDistribution: "Industrial Distribution",
  BusinessEquipmentSupplies: "Business Equipment & Supplies",
  SpecialtyIndustrialMachinery: "Specialty Industrial Machinery",
  MetalFabrication: "Metal Fabrication",
  PollutionTreatmentControls: "Pollution & Treatment Controls",
  ToolsAccessories: "Tools & Accessories",
  ElectricalEquipmentParts: "Electrical Equipment & Parts",
  AirportsAirServices: "Airports & Air Services",
  Airlines: "Airlines",
  Railroads: "Railroads",
  MarineShipping: "Marine Shipping",
  Trucking: "Trucking",
  IntegratedFreightLogistics: "Integrated Freight & Logistics",
  WasteManagement: "Waste Management",
  InformationTechnologyServices: "Information Technology Services",
  SoftwareApplication: "Software – Application",
  SoftwareInfrastructure: "Software – Infrastructure",
  CommunicationEquipment: "Communication Equipment",
  ComputerHardware: "Computer Hardware",
  ConsumerElectronics: "Consumer Electronics",
  ElectronicComponents: "Electronic Components",
  ElectronicsComputerDistribution: "Electronics & Computer Distribution",
  ScientificTechnicalInstruments: "Scientific & Technical Instruments",
  SemiconductorEquipmentMaterials: "Semiconductor Equipment & Materials",
  Semiconductors: "Semiconductors",
  Solar: "Solar",
};

/**
 * A record of descriptions for each industry.
 */
export const industryDescription: Record<Industry, string> = {
  AgriculturalInputs:
    "Companies that manufacture nitrogenous and phosphatic fertilizers, pesticides, seed, and other agricultural chemical products.",
  BuildingMaterials:
    "Companies that manufacture construction materials, including stone, clay, and brick products, cement, lime, gypsum, and concrete and other construction products. Excludes companies that manufacture finished and semi finished building products.",
  Chemicals:
    "Chemical manufacturing companies engaged in diverse chemical and chemical-related operations, and basic chemicals manufacturing.",
  SpecialtyChemicals:
    "Companies that use base chemicals to produce value-added chemicals that are used in a variety of products. Includes companies that produce polishes, adhesives and sealants, explosives, printing ink, paint, carbon black, acids, repellants, and cleaning solutions.",
  LumberWoodProduction:
    "Companies that grow timber, mill lumber, and manufacture wood and wood products for construction.",
  PaperPaperProducts:
    "Companies that manufacture and market paper and paper-related products from wood pulp and other fibers. Excludes companies that produce paper packaging products and are classified in the packaging and containers industry.",
  Aluminum: "Companies that produce, refine, market, and distribute aluminum and related aluminum-based products.",
  Copper:
    "Companies engaged in the exploration, mining, smelting, and refining of copper ores and related copper products.",
  OtherIndustrialMetalsMining:
    "Companies that mine, refine, produce, smelt, and mill industrial ores, including copper, lead, zinc, radium, vanadium, nickel, tin, titanium, and other related materials.",
  Gold: "Companies principally engaged in gold exploration, mining, processing, extraction, and smelting.",
  Silver: "Companies principally engaged in silver exploration, mining, processing, extraction, and smelting.",
  OtherPreciousMetalsMining:
    "Companies that mine, refine, produce, smelt, and mill precious metals, including silver, platinum, palladium, diamond, and other related minerals.",
  CokingCoal: "Companies that produce coking coal.",
  Steel:
    "Companies that produce steel plates, steel sheets, bar and rod materials, structural steel, steel pipes and tubes, and stainless steel.",
  AutoTruckDealerships:
    "Companies engaged in the specialty retail of new and used automobiles, trucks, and other vehicles through the operation and/or franchising of dealerships.",
  AutoManufacturers: "Leading worldwide designers and manufacturers of passenger cars and trucks.",
  AutoParts:
    "Companies that manufacture motor vehicle parts and accessories, including rubber and plastic products, such as tires and inner tubes, but do not manufacture complete car bodies.",
  RecreationalVehicles:
    "Companies that manufacture recreational vehicles, including self-contained motor homes, campers, all-terrain vehicles, travel/camper trailers, and snowmobiles.",
  FurnishingsFixturesAppliances:
    "Companies that manufacture and market wooden, metal, and upholstered furniture, mattresses, bedsprings, lighting fixtures, wooden flooring, wallpaper, and household products, such as utensils, cutlery, tableware, and appliances.",
  ResidentialConstruction:
    "Companies that build and renovate residential buildings, such as single-family houses, apartments, and hotels.",
  TextileManufacturing:
    "Companies that manufacture and mill textile products, including apparel fabrics, bedding and accessories, home furnishing fabrics, carpets and rugs, curtains and drapes, and other milled textile products.",
  ApparelManufacturing:
    "Companies that manufacture, design, market, source, and sell all lines of clothing for men, women, and children. Also includes companies that manufacture or distribute buttons, buckles, and other apparel parts.",
  FootwearAccessories:
    "Companies that manufacture, design, market, and sell lines of footwear and luggage, handbags and purses, belts, and other leather goods.",
  PackagingContainers:
    "Companies that manufacture and market paper, plastic, metal, and glass packaging products, including corrugated boxes, cardboard containers, bottles, cans, and plastic foam and containers.",
  PersonalServices:
    "Companies that provide services of a personal nature or that are particularly structured for the individual or group being served, including veterinary services, funeral and cemetery services, child care services, portrait and photo services, tax preparation and legal services, and other miscellaneous personal services.",
  Restaurants:
    "Companies that own, operate, and franchise full-service restaurants that engage in the retail sale of prepared food and drink.",
  ApparelRetail: "Companies engaged in the retail sale of clothing, shoes, and accessories.",
  DepartmentStores:
    "Companies engaged in the retail sale of a diverse mix of merchandise, emphasizing fashion apparel and accessories, home furnishings, electronics, and cosmetics.",
  HomeImprovementRetail:
    "Companies engaged in the retail sale of home improvement items, such as lumber, carpets, hardware and other building materials, plants and other garden supplies, and various other items for the home.",
  LuxuryGoods:
    "Companies engaged in the specialty retail of luxury items, including jewelry, watches, crystal, clothing, handbags, and accessories.",
  InternetRetail:
    "Companies engaged in the online retail sale of a diverse mix of merchandise. Excludes companies that target the travel industry and are classified in travel services.",
  SpecialtyRetail:
    "Companies engaged in the specialty retail of various goods and products not covered in a specific industry group. This group includes retailers such as bookstores, office-supply stores, gas stations, pawn shops, novelty shops, auto-parts stores, electronics stores, home furnishing stores, sporting goods stores, toy and hobby stores, music and video stores, and many other miscellaneous retailers.",
  Gambling:
    "Companies that own, operate, or manage lawful gaming activities and events, such as horse and dog racing, online gaming, bingo, and video lottery, as well as companies that supply products or services to gaming operators. It excludes companies operating casinos.",
  Leisure:
    "Companies that manufacture, design, market, and sell bicycles, sporting goods, photographic equipment, recreational equipment, toys, and other leisure products or services.",
  Lodging:
    "Companies that develop, manage, own, and operate lodging facilities, including motels, extended-stay and full-service hotels, and economy hotels and inns.",
  ResortsCasinos:
    "Companies that own, operate, and manage resort properties, including beach clubs, time-share properties, and luxury resort hotels and that conduct casino gaming operations.",
  TravelServices: "Companies that offer travel-related products or services, including online travel services.",
  AssetManagement:
    "Investment management firms offering diversified services such as asset administration, investment advice, portfolio or mutual fund management, money management, and venture capital.",
  BanksDiversified:
    "Global, diverse financial institutions serving the corporate and consumer needs of retail banking, investment banking, trust management, credit cards and mortgage banking.",
  BanksRegional:
    "Regional, diverse financial institutions serving the corporate, government, and consumer needs of retail banking, investment banking, trust management, credit cards, mortgage banking, savings and loan associations, building societies, cooperative banks, and homestead.",
  MortgageFinance: "Companies that originate, purchase, sell, and service home mortgage and equity loans.",
  CapitalMarkets:
    "Large, major investment houses offering investment banking, merchant banking, underwriting, brokerage, research, advisory, and trading services to broad-based national and international markets.",
  FinancialDataStockExchanges:
    "Companies that operate security exchanges, including companies that offer financial data such as ratings, investment research, and other research solutions.",
  InsuranceLife:
    "Companies that underwrite, market, and distribute life insurance and related products to individuals and families.",
  InsurancePropertyCasualty:
    "Companies that underwrite, market, and distribute fire, marine, and casualty insurance for property and other tangible assets.",
  InsuranceReinsurance: "Companies that underwrite and sell reinsurance.",
  InsuranceSpecialty:
    "Companies that underwrite, market, and distribute accident and health, sickness, mortgage, and other specialty or supplemental insurance to individuals and families.",
  InsuranceBrokers:
    "Companies acting primarily as agents or intermediaries in creating insurance contracts between clients and insurance companies.",
  InsuranceDiversified:
    "Insurance companies with diversified interests in life, health, and property and casualty insurance.",
  ShellCompanies:
    "A development-stage company with no or minimal revenue. Includes capital pool, blank check, shell, and holding companies.",
  FinancialConglomerates:
    "Companies that provide financial services, including banking, insurance, and capital markets, but with no dominant business line or source of revenue.",
  CreditServices:
    "Companies that extend credit and make loans to individuals and businesses through credit cards, installment loans, student loans, and business loans that are associated with other consumer and business credit instruments.",
  RealEstateDevelopment:
    "Companies that develop real estate and same properties held as inventory, or sold to others after development, with no specific portfolio composition.",
  RealEstateServices:
    "Companies that operate, manage, and lease real property with no specific portfolio composition. Includes real estate services like brokers and agents but excludes companies classified in the real estate – development industry.",
  RealEstateDiversified:
    "Companies engaged in multiple real estate activities, including development, sales, management, and related services. Excludes companies classified in real estate development and real estate services.",
  REITHealthcareFacilities:
    "Self-administered real estate investment trusts engaged in the development, acquisition, management, and disposition of healthcare properties, including long-term-care facilities, acute-care and rehab hospitals, psychiatric facilities, and substance-abuse centers.",
  REITHotelMotel:
    "Self-administered real estate investment trusts engaged in the development, acquisition, management, and disposition of lodging properties, including full- and limited-service hotels and motels.",
  REITIndustrial:
    "Self-administered real estate investment trusts engaged in the development, acquisition, management, and disposition of industrial properties, including bulk warehouses, self-storage facilities, distribution facilities, and other light industrial facilities.",
  REITOffice:
    "Self-administered real estate investment trusts engaged in the development, acquisition, management, and disposition of office properties, including office buildings, complexes, and centers.",
  REITResidential:
    "Self-administered real estate investment trusts engaged in the development, acquisition, management, and disposition of residential properties, including apartments, multifamily and single-family mortgage loans, manufactured housing, mobile-home parks, and other residential properties.",
  REITRetail:
    "Self-administered real estate investment trusts engaged in the development, acquisition, management, and disposition of retail properties, including community shopping centers, factory outlet shopping centers, enclosed shopping malls, strip centers, restaurants, and other retail properties.",
  REITMortgage:
    "Self-administered real estate investment trusts engaged in the acquisition, management, and disposition of mortgage-backed securities. Also includes companies that provide financing for income- producing real estate by purchasing or originating mortgages and mortgage-backed securities; and earns income from the interest on these investments.",
  REITSpecialty:
    "Self-administered real estate investment trusts engaged in the acquisition, management, and disposition of properties not classified elsewhere. Includes trusts that operate, lease, and invest in telecom towers, advertising spaces, timberland properties, and other properties not classified elsewhere.",
  REITDiversified:
    "Self-administered real estate investment trusts engaged in the acquisition, management, and disposition of diversified property holdings, with no specific portfolio composition.",
  BeveragesBrewers: "Companies that manufacture, sell, and distribute malt-based beverages, beers, and ales.",
  BeveragesWineriesDistilleries: "Companies that manufacture, sell, and distribute distilled liquors and wine.",
  BeveragesNonAlcoholic:
    "Companies that manufacture, sell, and distribute soft drinks, carbonated and spring water, fruit juices, and other nonalcoholic beverages.",
  Confectioners:
    "Companies that manufacture and refine raw sugar, syrup or finished cane and beet sugar, candy and chewing gum, chocolate, and cocoa products.",
  FarmProducts:
    "Companies that produce, raise, and grow agricultural and farm-based food products, including fruits, vegetables, other crop products, cattle, and eggs. Also includes seafood products.",
  HouseholdPersonalProducts:
    "Companies that manufacture and market soaps and other detergents, polishing and sanitation goods and produce glycerin from vegetable and animal fats and oils. Also includes companies that manufacture and market personal-care products, including perfume, cosmetics, and other toilet preparations, infant and adult sanitary paper products, shaving razors and blades.",
  PackagedFoods:
    "Companies that process and package food products, including frozen foods, grain products, canned foods, snack foods, health supplements, vitamins, and pet products.",
  EducationTrainingServices:
    "Companies that provide educational and training services, including college and junior-college courses, higher-education programs, technical and vocational training, and other education services.",
  DiscountStores: "Companies engaged in the retail sale of a variety of merchandise at low and discounted prices.",
  FoodDistribution:
    "Companies primarily engaged in the distribution and supply of food products, including packaged goods, meat, dairy products, frozen foods, and related groceries to grocery stores, restaurants, and other food-service centers.",
  GroceryStores:
    "Companies engaged in the retail sale of groceries, including dry goods, meat, produce, frozen foods, dairy products, seafood, deli/bakery, and nonfood items.",
  Tobacco:
    "Companies that manufacture and market cigarettes, e-cigarettes, snuff, cigars, chewing tobacco, and all other tobacco products.",
  Biotechnology:
    "Biotech and biopharmaceutical companies engaged in research, discovery, development, and production of innovative drug and drug-related technologies.",
  DrugManufacturersGeneral:
    "Major, global pharmaceutical manufacturers offering a broad and diverse line of drug and healthcare products; industry leaders that have made a significant commitment to the research and development of a long pipeline of drugs.",
  DrugManufacturersSpecialtyGeneric:
    "Companies engaged in development and discovery of branded forms of drug, drug-related products, generic drug products, and animal-related drugs. Also includes companies that cultivate, process, and farm cannabis or marijuana.",
  HealthcarePlans:
    "Companies that offer a wide variety of managed health products and services, including HMOs, PPOs, and other health insurance plans, and are largely U.S.-domiciled.",
  MedicalCareFacilities:
    "Companies that provide medical services through the ownership and operation of hospitals, and other auxiliary healthcare-related services, including healthcare staffing and ambulatory services. Also, companies that operate long-term-care facilities, such as assisted-living centers, nursing and retirement homes, substance-abuse centers, and centers for rehabilitation services.",
  PharmaceuticalRetailers:
    "Companies engaged in the retail sale of prescription drugs and patent medicines as well as a number of related lines, such as cosmetics, toiletries, and novelty merchandise.",
  HealthInformationServices:
    "Companies that develop and provide comprehensive physician practice management systems and software for hospitals, medical practices, and managed-care organizations.",
  MedicalDevices:
    "Companies that develop, manufacture, and market medical and surgical equipment and machinery, including orthopedic products, respiratory care equipment, x-ray equipment, laser systems, implants, pacemakers, and other major medical machines and apparatus.",
  MedicalInstrumentsSupplies:
    "Companies that develop, design, manufacture, and market medical and dental instruments and supplies, including wheelchairs, catheters, needles, syringes, eyewear and eyecare products, and other health-related supplies.",
  DiagnosticsResearch:
    "Companies that provide laboratory testing services through imaging and other diagnostic services to the medical industry.",
  MedicalDistribution:
    "Companies primarily engaged in the distribution and supply of medical instruments and supplies, ophthalmic goods, and other health-related items to the medical and healthcare industry.",
  UtilitiesIndependentPowerProducers:
    "Companies that own and operate merchant power generation facilities and sell electricity into retail and wholesale markets.",
  UtilitiesRenewable:
    "Companies that generate, produce, or transmit electric energy from renewable sources, including hydropower, wind, geothermal, biomass, solar, tidal, and wave.",
  UtilitiesRegulatedWater: "Companies that distribute water for sale, including water-treatment companies.",
  UtilitiesRegulatedElectric: "Companies that generate, transmit, or distribute electric energy for sale.",
  UtilitiesRegulatedGas: "Companies that transmit, store, or distribute natural gas.",
  UtilitiesDiversified:
    "Companies engaged in the regulated generation, transmission, or distribution of electricity and natural gas, merchant power generation facilities, and energy marketing operations.",
  TelecomServices:
    "Companies that provide local, national, international, and long-distance phone services, as well as companies offering wireless services. Also includes companies that provide services for faxing, prepaid phone cards, pay phones, and directory assistance, or that provide Internet access services.",
  AdvertisingAgencies:
    "Companies engaged in full-service advertising operations, including the planning, creating, producing, and placing of advertising in media such as TV, radio, and print. Also includes companies providing marketing services, including outdoor advertising, promotional materials, direct-mail services, digital marketing, event management services, and marketing research services.",
  Publishing:
    "Companies that publish periodicals, such as magazines, comic books, trade journals, books, pamphlets, e-publications, and newspapers.",
  Broadcasting:
    "Companies that own or operate radio broadcast stations and provide and produce radio programming services, television programming services, and television broadcast stations. Also includes companies providing Internet-based video on demand and pay-per-view programming services.",
  Entertainment:
    "Companies primarily operating with diversified holdings in movies, television, and other media-based entertainment. Also includes companies that produce and distribute motion pictures, television programmers, video, and the operation of movie theaters; and provide cable television services.",
  InternetContentInformation:
    "Companies that provide content, Internet navigation services, and reference guide information for the World Wide Web through its platforms, including social media, search engines, and networking platform companies.",
  ElectronicGamingMultimedia:
    "Companies that primarily develop or publish video games and other multimedia software applications for devices that include personal computers, video game systems, cellphones, tablets, and other portable media players.",
  OilGasDrilling: "Companies primarily engaged in the drilling for petroleum and natural gas.",
  OilGasEP: "Energy companies which are primarily engaged in oil and gas exploration and production.",
  OilGasIntegrated:
    "Major energy companies engaged in the diverse aspects of oil and gas operations, including crude oil and gas exploration, production, manufacturing, refining, marketing, and transportation.",
  OilGasMidstream:
    "Companies that own and operate oilfield pipelines and are involved in the gathering, processing, and transportation of natural crude petroleum.",
  OilGasRefiningMarketing: "Companies that refine, gather, market, and sell petroleum and petroleum products.",
  OilGasEquipmentServices:
    "Companies that provide oilfield services and equipment for activities such as contract drilling and seismic surveys. Also includes equipment and tool rental, pumping and processing services, and inspection and contracting services.",
  ThermalCoal:
    "Companies that mine thermal coal, which is used for generating energy. Excludes companies that mine coking coal to make steel.",
  Uranium: "Companies that mine, refine, produce, and mill uranium and uranium-related materials.",
  AerospaceDefense:
    "Companies that manufacture aerospace and defense products, including aircraft and aircraft parts, tanks, guided missiles, space vehicles, ships and marine equipment, and other aerospace and defense components and systems, as well as companies supporting these products through repair and maintenance services.",
  SpecialtyBusinessServices:
    "Companies that provide services to the commercial or business market, including information distribution, warehousing, graphic design, accounting, printing, and miscellaneous services.",
  ConsultingServices:
    "Companies that provide management, research, and consulting services to businesses and other agencies. Includes companies engaged in strategic and management consulting services, interior design, and information and analytics.",
  RentalLeasingServices:
    "Companies that rent or lease durable goods to the commercial and consumer market, including cars and trucks, medical and industrial equipment, appliances and tools, and miscellaneous goods.",
  SecurityProtectionServices:
    "Companies that provide security and protective services, including protective or preventive devices, security guards and inspection services, security alarm and monitoring systems, detention and correction facilities, and other security-based services.",
  StaffingEmploymentServices:
    "Companies that provide staffing and employment services, including temporary staffing and permanent placement, outsources workforce and other employment-related services to businesses and government. Also includes companies providing online staffing services.",
  Conglomerates:
    "Companies that are in several separate lines of business with no single line providing the dominant source of revenue or income.",
  EngineeringConstruction:
    "Companies engaged in the design, construction, or contracting of industrial and nonresidential structures, streets and highways, bridges and tunnels, docks and piers, dams and water projects, utility lines, and other large building projects. Also includes companies that provide engineering consulting and architectural services to consumer and commercial clients.",
  InfrastructureOperations:
    "Companies that develop, finance, maintain, or manage infrastructure operations such as ports, airports, and roadways.",
  BuildingProductsEquipment:
    "Companies that manufacture building and construction products and materials, including ceramic floor and wall tiles, plumbing, HVAC, framing structures, and doors. Excludes companies that are classified in the building materials industry.",
  FarmHeavyConstructionMachinery:
    "Companies that manufacture agricultural and construction machinery, including tractors, planting and harvesting machines, cranes, earthmovers, excavators, and related equipment and machinery. Includes truck manufacturers that provide local and long-haul trucking and transfer services for freight and cargo.",
  IndustrialDistribution:
    "Companies primarily engaged in the distribution and supply of industrial equipment, including construction and farming machinery, garden equipment and supplies, and other industrial items to a diversified market of redistributors and end users.",
  BusinessEquipmentSupplies:
    "Companies that manufacture and market office and business machines, such as copiers, fax machines, postage meters, point-of-sale terminals, and ATMs.",
  SpecialtyIndustrialMachinery:
    "Companies engaged in diversified machinery manufacturing operations, including paper and food production machines, printing machinery, engines and turbines, air and gas processors, blowers and fans, furnaces and ovens, and other general and special industry machines.",
  MetalFabrication:
    "Companies that fabricate, stamp, or form iron, steel, or other metals into products such as structured components by cutting, bending, and assembling processes of basic metals to create a final product.",
  PollutionTreatmentControls:
    "Companies that manufacture equipment designed to control pollution, including control systems, hazardous waste disposal systems, recovery systems, treatment processes, filtration systems, cleaning and separation applications, and recycling machinery.",
  ToolsAccessories:
    "Companies that manufacture small, hand-held tools, including power-driven drills, welding apparatus, lawn and garden equipment, and other power or manually operated tools and accessories, such as hardware, nuts, bolts, rivets, and other fasteners.",
  ElectricalEquipmentParts:
    "Companies that manufacture electrical equipment (such as smart-grid electrical equipment, utility metering, high-and low-voltage electrical equipment, transmission control devices, switches, and lighting distribution boxes), batteries, electrical wires and cables, and automation control.",
  AirportsAirServices:
    "Air transportation companies that provide related air services, including helicopter transportation, air-charter services, in-flight catering services, and air emergency and business-related services.",
  Airlines:
    "Major international passenger airline companies that fly a wide range of domestic and international routes.",
  Railroads:
    "Companies that provide transportation of freight by line-haul railroad as well as related railroad equipment and repair services. Includes companies offering passenger services via railway and roadways.",
  MarineShipping:
    "Companies that transport freight and cargo via water and operate marine ports. Includes companies that provide passenger services via water.",
  Trucking: "Companies that provide local and long-haul trucking and transfer services for freight and cargo.",
  IntegratedFreightLogistics:
    "Companies that transport freight and cargo via diversified methods such as railroads, airlines, and waterways.",
  WasteManagement:
    "Companies that collect, treat, store, transfer, recycle, and dispose of waste materials, as well as companies that provide supporting environmental, engineering, and consulting services.",
  InformationTechnologyServices:
    "Companies that provide computer-system design, network and systems operations, repair services, technical support, computer technology consulting, development, and implementation services.",
  SoftwareApplication:
    "Companies that primarily design, develop, market, and support application software programs, including those that are cloud-based, for specific consumer and business functions.",
  SoftwareInfrastructure:
    "Companies that develop, design, support, and provide system software and services, including operating systems, networking software and devices, web portal services, cloud storage, and related services.",
  CommunicationEquipment:
    "Companies that design, develop, manufacture, and market equipment for the communication industry, including fiber-optic cable; telecom peripherals; voice and data transmission and processing equipment; satellite products and equipment; video-conferencing systems and equipment; and interactive communication systems. Also includes companies that offer networking products that provide connectivity solutions for multi-use computing environments.",
  ComputerHardware:
    "Companies that design, manufacture, and market computer systems, high mainframe servers, supercomputer, and 3D printers and scanners. Also includes companies that manufacture and market data storage products and other storage and backup devices for computers.",
  ConsumerElectronics:
    "Companies that manufacture and market mobile communication products and household audio and video equipment, including radios, stereos, televisions, DVD player and personal use Drones. Excludes electric household appliances.",
  ElectronicComponents:
    "Companies that design, develop, manufacture, and market electronic devices, including electron tubes; electronic capacitors; electronic resistors; electronic coil and transformers; sensors; LED, TFT, and LCD displays; electronic connectors; printed circuit boards; circuit assemblies; and other general-purpose electronics components and products.",
  ElectronicsComputerDistribution:
    "Companies primarily engaged in the distribution, supply, and support of computers and computer systems, peripheral equipment, and software and other technological goods, including electronic equipment and appliances, electrical cable, wires, and other components to various consumer, commercial, and manufacturing customers.",
  ScientificTechnicalInstruments:
    "Companies that design, develop, manufacture, and market sophisticated electronics of a technical nature, including lab apparatus, process and flow control devices, precise measurement and signal processing tools, search and navigation equipment, and other scientific or technical analytical or measuring devices.",
  SemiconductorEquipmentMaterials:
    "Companies that design, develop, manufacture, and market equipment, spare parts, tools, cleaning devices, and related materials for the semiconductor industry.",
  Semiconductors:
    "Semiconductor companies that design, manufacture, and market integrated circuits, microprocessors, logic devices, chipsets, and memory chips for a wide variety of users. Includes companies that design, manufacture, and market general-application integrated circuits and memory and memory-intensive products.",
  Solar: "Companies that design, manufacture, market, or install solar power systems and components.",
};
