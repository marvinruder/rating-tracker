-- CreateEnum
CREATE TYPE "Country" AS ENUM ('AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR', 'IO', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KR', 'KP', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'MK', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'SS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ', 'VU', 'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('AgriculturalInputs', 'BuildingMaterials', 'Chemicals', 'SpecialtyChemicals', 'LumberWoodProduction', 'PaperPaperProducts', 'Aluminum', 'Copper', 'OtherIndustrialMetalsMining', 'Gold', 'Silver', 'OtherPreciousMetalsMining', 'CokingCoal', 'Steel', 'AutoTruckDealerships', 'AutoManufacturers', 'AutoParts', 'RecreationalVehicles', 'FurnishingsFixturesAppliances', 'ResidentialConstruction', 'TextileManufacturing', 'ApparelManufacturing', 'FootwearAccessories', 'PackagingContainers', 'PersonalServices', 'Restaurants', 'ApparelRetail', 'DepartmentStores', 'HomeImprovementRetail', 'LuxuryGoods', 'InternetRetail', 'SpecialtyRetail', 'Gambling', 'Leisure', 'Lodging', 'ResortsCasinos', 'TravelServices', 'AssetManagement', 'BanksDiversified', 'BanksRegional', 'MortgageFinance', 'CapitalMarkets', 'FinancialDataStockExchanges', 'InsuranceLife', 'InsurancePropertyCasualty', 'InsuranceReinsurance', 'InsuranceSpecialty', 'InsuranceBrokers', 'InsuranceDiversified', 'ShellCompanies', 'FinancialConglomerates', 'CreditServices', 'RealEstateDevelopment', 'RealEstateServices', 'RealEstateDiversified', 'REITHealthcareFacilities', 'REITHotelMotel', 'REITIndustrial', 'REITOffice', 'REITResidential', 'REITRetail', 'REITMortgage', 'REITSpecialty', 'REITDiversified', 'BeveragesBrewers', 'BeveragesWineriesDistilleries', 'BeveragesNonAlcoholic', 'Confectioners', 'FarmProducts', 'HouseholdPersonalProducts', 'PackagedFoods', 'EducationTrainingServices', 'DiscountStores', 'FoodDistribution', 'GroceryStores', 'Tobacco', 'Biotechnology', 'DrugManufacturersGeneral', 'DrugManufacturersSpecialtyGeneric', 'HealthcarePlans', 'MedicalCareFacilities', 'PharmaceuticalRetailers', 'HealthInformationServices', 'MedicalDevices', 'MedicalInstrumentsSupplies', 'DiagnosticsResearch', 'MedicalDistribution', 'UtilitiesIndependentPowerProducers', 'UtilitiesRenewable', 'UtilitiesRegulatedWater', 'UtilitiesRegulatedElectric', 'UtilitiesRegulatedGas', 'UtilitiesDiversified', 'TelecomServices', 'AdvertisingAgencies', 'Publishing', 'Broadcasting', 'Entertainment', 'InternetContentInformation', 'ElectronicGamingMultimedia', 'OilGasDrilling', 'OilGasEP', 'OilGasIntegrated', 'OilGasMidstream', 'OilGasRefiningMarketing', 'OilGasEquipmentServices', 'ThermalCoal', 'Uranium', 'AerospaceDefense', 'SpecialtyBusinessServices', 'ConsultingServices', 'RentalLeasingServices', 'SecurityProtectionServices', 'StaffingEmploymentServices', 'Conglomerates', 'EngineeringConstruction', 'InfrastructureOperations', 'BuildingProductsEquipment', 'FarmHeavyConstructionMachinery', 'IndustrialDistribution', 'BusinessEquipmentSupplies', 'SpecialtyIndustrialMachinery', 'MetalFabrication', 'PollutionTreatmentControls', 'ToolsAccessories', 'ElectricalEquipmentParts', 'AirportsAirServices', 'Airlines', 'Railroads', 'MarineShipping', 'Trucking', 'IntegratedFreightLogistics', 'WasteManagement', 'InformationTechnologyServices', 'SoftwareApplication', 'SoftwareInfrastructure', 'CommunicationEquipment', 'ComputerHardware', 'ConsumerElectronics', 'ElectronicComponents', 'ElectronicsComputerDistribution', 'ScientificTechnicalInstruments', 'SemiconductorEquipmentMaterials', 'Semiconductors', 'Solar');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('Small', 'Mid', 'Large');

-- CreateEnum
CREATE TYPE "Style" AS ENUM ('Value', 'Blend', 'Growth');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BOV', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHE', 'CHF', 'CHW', 'CLF', 'CLP', 'CNY', 'COP', 'COU', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GBX', 'GEL', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MXV', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'USN', 'UYI', 'UYU', 'UYW', 'UZS', 'VED', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XBA', 'XBB', 'XBC', 'XBD', 'XCD', 'XDR', 'XOF', 'XPD', 'XPF', 'XPT', 'XSU', 'XTS', 'XUA', 'XXX', 'YER', 'ZAR', 'ZMW', 'ZWL');

-- CreateEnum
CREATE TYPE "MSCIESGRating" AS ENUM ('AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC');

-- CreateTable
CREATE TABLE "Stock" (
    "ticker" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "country" "Country" NOT NULL,
    "isin" CHAR(12) NOT NULL,
    "industry" "Industry",
    "size" "Size",
    "style" "Style",
    "financialScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "esgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "morningstarID" VARCHAR(255),
    "morningstarLastFetch" TIMESTAMP(6),
    "starRating" SMALLINT,
    "dividendYieldPercent" DOUBLE PRECISION,
    "priceEarningRatio" DOUBLE PRECISION,
    "currency" "Currency",
    "lastClose" DOUBLE PRECISION,
    "morningstarFairValue" DOUBLE PRECISION,
    "morningstarFairValuePercentageToLastClose" DOUBLE PRECISION,
    "low52w" DOUBLE PRECISION,
    "high52w" DOUBLE PRECISION,
    "positionIn52w" DOUBLE PRECISION,
    "marketScreenerID" VARCHAR(255),
    "marketScreenerLastFetch" TIMESTAMP(6),
    "analystConsensus" DOUBLE PRECISION,
    "analystCount" SMALLINT,
    "analystTargetPrice" DOUBLE PRECISION,
    "analystTargetPricePercentageToLastClose" DOUBLE PRECISION,
    "msciID" VARCHAR(255),
    "msciLastFetch" TIMESTAMP(6),
    "msciESGRating" "MSCIESGRating",
    "msciTemperature" DOUBLE PRECISION,
    "ric" VARCHAR(25),
    "refinitivLastFetch" TIMESTAMP(6),
    "refinitivESGScore" SMALLINT,
    "refinitivEmissions" SMALLINT,
    "spID" DOUBLE PRECISION,
    "spLastFetch" TIMESTAMP(6),
    "spESGScore" SMALLINT,
    "sustainalyticsID" VARCHAR(255),
    "sustainalyticsESGRisk" DOUBLE PRECISION,
    "description" TEXT,
    "marketCap" DOUBLE PRECISION,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("ticker")
);

-- CreateTable
CREATE TABLE "User" (
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "avatar" TEXT,
    "phone" VARCHAR(16),
    "accessRights" SMALLINT NOT NULL DEFAULT 0,
    "subscriptions" SMALLINT,
    "credentialID" VARCHAR(255) NOT NULL,
    "credentialPublicKey" VARCHAR(8192) NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_name_key" ON "Stock"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_isin_key" ON "Stock"("isin");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_morningstarID_key" ON "Stock"("morningstarID");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_marketScreenerID_key" ON "Stock"("marketScreenerID");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_msciID_key" ON "Stock"("msciID");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_ric_key" ON "Stock"("ric");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_spID_key" ON "Stock"("spID");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_sustainalyticsID_key" ON "Stock"("sustainalyticsID");

