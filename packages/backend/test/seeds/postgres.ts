/* eslint-disable max-len */
import type { OmitDynamicAttributesStock, Stock } from "@rating-tracker/commons";
import { GENERAL_ACCESS, optionalStockValuesNull, STOCK_UPDATE_MESSAGE } from "@rating-tracker/commons";

import client from "../../src/db/client";
import { addDynamicAttributesToStockData } from "../../src/models/dynamicStockAttributes";

const stockData: Stock[] = [
  {
    ticker: "exampleALV",
    name: "Allianz SE",
    isin: "DE0008404005",
    country: "DE",
    industry: "InsuranceDiversified",
    size: "Large",
    style: "Value",
    morningstarID: "0P00009QNO",
    morningstarLastFetch: new Date("2022-12-15T20:12:27.908Z"),
    starRating: 4,
    dividendYieldPercent: 5.26,
    priceEarningRatio: 12.27,
    currency: "EUR",
    lastClose: 204,
    morningstarFairValue: 230,
    marketCap: 82280000000,
    low52w: 156.22,
    high52w: 232.5,
    marketScreenerID: "ALLIANZ-SE-436843",
    marketScreenerLastFetch: new Date("2022-12-18T16:46:11.120Z"),
    analystConsensus: 7.8,
    analystCount: 18,
    analystTargetPrice: 241.74,
    msciID: "IID000000002156841",
    msciLastFetch: new Date("2022-12-14T21:19:47.194Z"),
    msciESGRating: "AA",
    msciTemperature: 1.4,
    ric: "ALVG.DE",
    lsegLastFetch: new Date("2022-12-18T16:46:12.974Z"),
    lsegESGScore: 92,
    lsegEmissions: 91,
    spID: 4174043,
    spLastFetch: new Date("2022-12-18T16:46:23.261Z"),
    spESGScore: 89,
    sustainalyticsID: "allianz-se/1008477053",
    sustainalyticsESGRisk: 13.3,
    description:
      "Allianz is a composite insurer with global operations. It sells motor, home, travel, and personal liability insurance through its property and casualty division. This unit also houses Allianz Partners, Allianz Direct, Allianz Global Corporate & Specialty, reinsurance, and Euler Hermes. Allianz's largest P&C markets are Germany, France, the United Kingdom, and Australia. The life and health business sells health, disability, and life insurance, pensions, annuities, long-term savings, and reinsurance. Savings products include traditional with guarantees, unit-linked with no guarantees, and capital-efficient with some guarantees. Life and health’s largest markets are Germany, Italy, the United States, and France. Allianz also holds asset-management units Allianz Global Investors and Pimco.",
  },
  {
    ticker: "exampleAAPL",
    name: "Apple Inc",
    isin: "US0378331005",
    country: "US",
    industry: "ConsumerElectronics",
    size: "Large",
    style: "Growth",
    morningstarID: "0P000000GY",
    morningstarLastFetch: new Date("2022-12-16T21:58:54.979Z"),
    starRating: 2,
    dividendYieldPercent: 0.67,
    priceEarningRatio: 22.32,
    currency: "USD",
    lastClose: 136.5,
    morningstarFairValue: 130,
    marketCap: 2171000000000,
    low52w: 129.04,
    high52w: 182.94,
    marketScreenerID: "APPLE-INC-4849",
    marketScreenerLastFetch: new Date("2022-12-18T16:46:56.697Z"),
    analystConsensus: 8.1,
    analystCount: 45,
    analystTargetPrice: 175.12949999999998,
    msciID: "IID000000002157615",
    msciLastFetch: new Date("2022-12-14T21:29:55.242Z"),
    msciESGRating: "BBB",
    msciTemperature: 1.3,
    ric: "AAPL.O",
    lsegLastFetch: new Date("2022-12-18T16:46:57.835Z"),
    lsegESGScore: 80,
    lsegEmissions: 97,
    spID: 4004205,
    spLastFetch: new Date("2022-12-18T21:14:17.177Z"),
    spESGScore: 40,
    sustainalyticsID: "apple-inc/1007903183",
    sustainalyticsESGRisk: 16.7,
    description:
      "Apple designs a wide variety of consumer electronic devices, including smartphones (iPhone), tablets (iPad), PCs (Mac), smartwatches (Apple Watch), and AirPods. The iPhone makes up most of Apple’s total revenue. In addition, Apple offers its customers a variety of services such as Apple Music, iCloud, Apple Care, Apple TV+, Apple Arcade, Apple Fitness, Apple Card, and Apple Pay, among others. Apple's products include internally developed software and semiconductors, and the firm is well known for its integration of hardware, software, semiconductors, and services. Apple's products are distributed online as well as through company-owned stores and third-party retailers. The company generates roughly 40% of its revenue from the Americas, with the remainder earned internationally.",
  },
  {
    ticker: "exampleBN",
    name: "Danone SA",
    isin: "FR0000120644",
    country: "FR",
    industry: "PackagedFoods",
    size: "Large",
    style: "Blend",
    morningstarID: "0P00009WEL",
    morningstarLastFetch: new Date("2022-12-15T20:12:18.404Z"),
    starRating: 4,
    dividendYieldPercent: 3.9,
    priceEarningRatio: 20.28,
    currency: "EUR",
    lastClose: 49.73,
    morningstarFairValue: 56,
    marketCap: 31810000000,
    low52w: 46.48,
    high52w: 58.24,
    marketScreenerID: "DANONE-4634",
    marketScreenerLastFetch: new Date("2022-12-18T16:47:25.201Z"),
    analystConsensus: 6,
    analystCount: 24,
    analystTargetPrice: 57.63707,
    msciID: "IID000000002168368",
    msciLastFetch: new Date("2022-12-14T21:19:52.010Z"),
    msciESGRating: "AAA",
    msciTemperature: 1.9,
    ric: "DANO.PA",
    lsegLastFetch: new Date("2022-12-18T16:47:30.346Z"),
    lsegESGScore: 84,
    lsegEmissions: 95,
    spID: 4307022,
    spLastFetch: new Date("2022-12-18T16:47:35.704Z"),
    spESGScore: 45,
    sustainalyticsID: "danone-sa/1008007595",
    sustainalyticsESGRisk: 19.9,
    description:
      "Following the acquisition of WhiteWave, Danone restructured the firm into three broad segments: essential dairy and plant-based products, which represents just over half of group revenue; specialised nutrition; and bottled water. The firm's portfolio includes well-known brands such as Danone/Dannon dairy products, Nutrilon and Cow & Gate infant nutrition, and Evian and Volvic bottled water. Danone derives about 60% of its annual sales outside Western Europe, up from about just one third in 2001.",
  },
  {
    ticker: "exampleIBE",
    name: "Iberdrola SA",
    isin: "ES0144580Y14",
    country: "ES",
    industry: "UtilitiesDiversified",
    size: "Large",
    style: "Blend",
    morningstarID: "0P0000A4Z3",
    morningstarLastFetch: new Date("2022-12-15T20:12:33.975Z"),
    starRating: 3,
    dividendYieldPercent: 4.02,
    priceEarningRatio: 16.08,
    currency: "EUR",
    lastClose: 11.06,
    morningstarFairValue: 10.6,
    marketCap: 66630000000,
    low52w: 8.47,
    high52w: 11.49,
    marketScreenerID: "IBERDROLA-S-A-355153",
    marketScreenerLastFetch: new Date("2022-12-18T16:48:15.345Z"),
    analystConsensus: 7,
    analystCount: 22,
    analystTargetPrice: 12.074202,
    msciID: "IID000000002126836",
    msciLastFetch: new Date("2022-12-14T21:19:42.232Z"),
    msciESGRating: "AAA",
    msciTemperature: 1.6,
    ric: "IBE.MC",
    lsegLastFetch: new Date("2022-12-18T16:48:18.230Z"),
    lsegESGScore: 88,
    lsegEmissions: 97,
    spID: 4102079,
    spLastFetch: new Date("2022-12-18T16:48:23.641Z"),
    spESGScore: 89,
    sustainalyticsID: "iberdrola-sa/1008395546",
    sustainalyticsESGRisk: 24.8,
    description:
      "Iberdrola is one of the largest utilities in the world with electric utility operations in nearly 40 countries. The company has a 52-gigawatt portfolio of hydro, wind, natural gas, and nuclear power plants. It is the largest owner of wind farms in the world, representing nearly 40% of its portfolio. Although the company has recently developed or acquired distribution and power generation assets in other geographic areas, Spain is still home to around 50% of its power generation capacity. Iberdrola also owns and operates electricity and distribution networks in Spain, the U.K., Brazil, and the U.S.",
  },
  {
    ticker: "exampleKGX",
    name: "Kion Group AG",
    isin: "DE000KGX8881",
    country: "DE",
    industry: "FarmHeavyConstructionMachinery",
    size: "Mid",
    style: "Value",
    morningstarID: "0P0000Z3A6",
    morningstarLastFetch: new Date("2022-12-15T20:12:06.763Z"),
    starRating: 5,
    dividendYieldPercent: 5.18,
    priceEarningRatio: 8.76,
    currency: "EUR",
    lastClose: 29.19,
    morningstarFairValue: 50,
    marketCap: 3830000000,
    low52w: 18.66,
    high52w: 98.82,
    marketScreenerID: "KION-GROUP-AG-13495387",
    marketScreenerLastFetch: new Date("2022-12-18T16:48:49.606Z"),
    analystConsensus: 8.2,
    analystCount: 18,
    analystTargetPrice: 39.49407,
    ric: "KGX.DE",
    lsegLastFetch: new Date("2022-12-18T16:48:59.322Z"),
    lsegESGScore: 80,
    lsegEmissions: 77,
    spID: 4996040,
    spLastFetch: new Date("2022-12-18T16:49:02.506Z"),
    spESGScore: 62,
    sustainalyticsID: "kion-group-ag/1037107109",
    sustainalyticsESGRisk: 26.6,
    description:
      "Kion Group is the number-two forklift truck manufacturer globally, after Toyota, and the number-one global warehouse automation equipment supplier. The Germany-headquartered company gets 70% of its revenue from the sale of new forklifts and maintenance services. Another roughly 30%, and growing portion, comes from warehouse automation equipment under the Dematic division, which caters to sectors such as e-commerce, third-party logistics, and supermarkets. Kion's forklift trucks and warehouse equipment service the same end markets.",
  },
  {
    ticker: "exampleMELI",
    name: "MercadoLibre Inc",
    isin: "US58733R1023",
    country: "UY",
    industry: "InternetRetail",
    size: "Large",
    style: "Growth",
    morningstarID: "0P00009FL7",
    morningstarLastFetch: new Date("2022-12-15T20:12:38.930Z"),
    starRating: 4,
    dividendYieldPercent: 0,
    priceEarningRatio: 161.29,
    currency: "USD",
    lastClose: 867.3,
    morningstarFairValue: 1140,
    marketCap: 43620000000,
    low52w: 600.69,
    high52w: 1359.61,
    marketScreenerID: "MERCADOLIBRE-INC-58469",
    marketScreenerLastFetch: new Date("2022-12-18T16:49:27.283Z"),
    analystConsensus: 8.4,
    analystCount: 22,
    analystTargetPrice: 1307.0211,
    msciID: "IID000000002153488",
    msciLastFetch: new Date("2022-12-14T21:19:55.885Z"),
    msciESGRating: "A",
    msciTemperature: 1.7,
    ric: "MELI.O",
    lsegLastFetch: new Date("2022-12-18T16:49:28.657Z"),
    lsegESGScore: 69,
    lsegEmissions: 66,
    spID: 4160258,
    sustainalyticsID: "mercadolibre-inc/1042200630",
    sustainalyticsESGRisk: 22.1,
    description:
      "MercadoLibre runs the largest e-commerce marketplace in Latin America, connecting a network of more than 148 million active users and 1 million active sellers as of the end of 2022 across an 18-country footprint. The company also operates a host of complementary businesses, with shipping solutions (Mercado Envios), a payment and financing operation (Mercado Pago and Mercado Credito), advertisements (Mercado Clics), classifieds, and a turnkey e-commerce solution (Mercado Shops) rounding out its arsenal. MercadoLibre generates revenue from final value fees, advertising royalties, payment processing, insertion fees, subscription fees, and interest income from consumer and small-business lending.",
  },
  {
    ticker: "exampleNEM",
    name: "Newmont Corp",
    isin: "US6516391066",
    country: "US",
    industry: "Gold",
    size: "Mid",
    style: "Value",
    morningstarID: "0P000003WE",
    morningstarLastFetch: new Date("2022-12-15T20:12:47.926Z"),
    dividendYieldPercent: 4.67,
    priceEarningRatio: 38.61,
    currency: "USD",
    lastClose: 47.11,
    morningstarFairValue: 46,
    marketCap: 37390000000,
    low52w: 37.45,
    high52w: 86.37,
    marketScreenerID: "NEWMONT-CORPORATION-13711",
    marketScreenerLastFetch: new Date("2022-12-18T16:57:18.564Z"),
    analystConsensus: 6.6,
    analystCount: 22,
    analystTargetPrice: 54.27072,
    msciID: "IID000000002177254",
    msciLastFetch: new Date("2022-12-14T21:19:27.773Z"),
    msciESGRating: "AA",
    msciTemperature: 1.5,
    ric: "NEM",
    lsegLastFetch: new Date("2022-12-18T16:57:22.367Z"),
    lsegESGScore: 87,
    lsegEmissions: 94,
    spID: 4075105,
    spLastFetch: new Date("2022-12-18T16:57:28.318Z"),
    spESGScore: 83,
    sustainalyticsID: "newmont-corp/1008170041",
    sustainalyticsESGRisk: 20.3,
    description:
      "Newmont Corp is primarily a gold producer with operations and/or assets in the United States, Canada, Mexico, Dominican Republic, Peru, Suriname, Argentina, Chile, Australia, and Ghana. It is also engaged in the production of copper, silver, lead and zinc. The company's operations are organized in five geographic regions: North America, South America, Australia, Africa and Nevada.",
  },
  {
    ticker: "exampleNOVO B",
    name: "Novo Nordisk A/S",
    isin: "DK0060534915",
    country: "DK",
    industry: "Biotechnology",
    size: "Large",
    style: "Growth",
    morningstarID: "0P0000A5BQ",
    morningstarLastFetch: new Date("2022-12-15T20:12:13.131Z"),
    starRating: 2,
    dividendYieldPercent: 1.19,
    priceEarningRatio: 40.49,
    currency: "DKK",
    lastClose: 937.5,
    morningstarFairValue: 760,
    marketCap: 2110000000000,
    low52w: 604.4,
    high52w: 940,
    marketScreenerID: "NOVO-NORDISK-A-S-1412980",
    marketScreenerLastFetch: new Date("2022-12-18T16:57:43.959Z"),
    analystConsensus: 7.4,
    analystCount: 24,
    analystTargetPrice: 904.875,
    msciID: "IID000000002135404",
    msciLastFetch: new Date("2022-12-14T21:19:33.088Z"),
    msciESGRating: "AAA",
    msciTemperature: 1.3,
    ric: "NOVOb.CO",
    lsegLastFetch: new Date("2022-12-18T16:57:46.094Z"),
    lsegESGScore: 85,
    lsegEmissions: 89,
    spID: 4194544,
    spLastFetch: new Date("2022-12-18T16:57:50.516Z"),
    spESGScore: 58,
    sustainalyticsID: "novo-nordisk-a-s/1008201698",
    sustainalyticsESGRisk: 24,
    description:
      "With almost 50% market share by volume of the global insulin market, Novo Nordisk is the leading provider of diabetes-care products in the world. Based in Denmark, the company manufactures and markets a variety of human and modern insulins, injectable diabetes treatments, oral antidiabetic agents, and obesity treatments. Novo also has a biopharmaceutical segment (constituting roughly 15% of revenue) that specializes in protein therapies for hemophilia and other disorders.",
  },
  {
    ...optionalStockValuesNull,
    ticker: "exampleNULL",
    name: "Null Inc.",
    isin: "XX0000000000",
    country: "AX",
  },
  {
    ticker: "exampleORSTED",
    name: "Ørsted A/S",
    isin: "DK0060094928",
    country: "DK",
    industry: "UtilitiesRenewable",
    size: "Large",
    style: "Growth",
    morningstarID: "0P0001846T",
    morningstarLastFetch: new Date("2022-12-15T20:12:22.891Z"),
    starRating: 5,
    dividendYieldPercent: 1.88,
    priceEarningRatio: 15.31,
    currency: "DKK",
    lastClose: 663.6,
    morningstarFairValue: 920,
    marketCap: 279000000000,
    low52w: 567,
    high52w: 918.4,
    marketScreenerID: "ORSTED-A-S-28607554",
    marketScreenerLastFetch: new Date("2022-12-18T16:58:13.295Z"),
    analystConsensus: 7.1,
    analystCount: 24,
    analystTargetPrice: 838.1268,
    msciID: "IID000000002226401",
    msciLastFetch: new Date("2022-12-14T21:19:37.853Z"),
    msciESGRating: "AAA",
    msciTemperature: 1.7,
    ric: "ORSTED.CO",
    lsegLastFetch: new Date("2022-12-18T16:58:14.680Z"),
    lsegESGScore: 72,
    lsegEmissions: 85,
    spID: 4554125,
    spLastFetch: new Date("2022-12-18T16:58:18.720Z"),
    spESGScore: 35,
    sustainalyticsID: "-rsted-a-s/1014371079",
    sustainalyticsESGRisk: 16.4,
    description:
      "Danish company Orsted was named Dong Energy until the sale of all its oil and gas fields to Ineos in 2017, soon after the May 2016 initial public offering. Orsted is now focused on renewable assets, especially offshore wind farms. It operated 8.9 GW of offshore wind farms at the end of 2022. The United Kingdom is the biggest country of operation, ahead of Germany and Denmark. The group intends to develop its footprint outside Europe with projects in Taiwan and in the U.S. Orsted is also involved in more traditional utilities business like conventional power plants and gas supply, but these activities are noncore. Orsted intends to phase out coal by 2023.",
  },
  {
    ticker: "exampleTSM",
    name: "Taiwan Semiconductor Manufacturing Co Ltd",
    isin: "US8740391003",
    country: "TW",
    industry: "Semiconductors",
    size: "Large",
    style: "Growth",
    morningstarID: "0P000005AR",
    morningstarLastFetch: new Date("2022-12-15T20:12:43.350Z"),
    starRating: 5,
    dividendYieldPercent: 2.34,
    priceEarningRatio: 14.43,
    currency: "USD",
    lastClose: 79.57,
    morningstarFairValue: 133,
    marketCap: 406800000000,
    low52w: 59.43,
    high52w: 128.66,
    marketScreenerID: "TAIWAN-SEMICONDUCTOR-MANU-40246786",
    marketScreenerLastFetch: new Date("2022-12-18T16:58:48.518Z"),
    analystConsensus: 9,
    analystCount: 31,
    analystTargetPrice: 105.66895999999998,
    msciID: "IID000000002186091",
    msciLastFetch: new Date("2022-12-14T21:19:59.951Z"),
    msciESGRating: "AAA",
    msciTemperature: 1.5,
    ric: "2330.TW",
    lsegLastFetch: new Date("2022-12-18T16:58:50.302Z"),
    lsegESGScore: 77,
    lsegEmissions: 96,
    spID: 4589256,
    spLastFetch: new Date("2022-12-18T16:58:55.111Z"),
    spESGScore: 84,
    sustainalyticsID: "taiwan-semiconductor-manufacturing-co-ltd/1008258321",
    sustainalyticsESGRisk: 13.6,
    description:
      "Taiwan Semiconductor Manufacturing Co. is the world's largest dedicated chip foundry, with over 57% market share in 2021 per Gartner. TSMC was founded in 1987 as a joint venture of Philips, the government of Taiwan, and private investors. It went public as an ADR in the U.S. in 1997. TSMC's scale and high-quality technology allow the firm to generate solid operating margins, even in the highly competitive foundry business. Furthermore, the shift to the fabless business model has created tailwinds for TSMC. The foundry leader has an illustrious customer base, including Apple, AMD, and Nvidia, that looks to apply cutting-edge process technologies to its semiconductor designs.",
  },
].map((stock: OmitDynamicAttributesStock) => addDynamicAttributesToStockData({ ...optionalStockValuesNull, ...stock }));

/**
 * Writes example stock data into the stock table in the database. Must only be used in tests.
 */
const applyStockSeed = async (): Promise<void> => {
  await client.stock.createMany({
    data: stockData,
  });
};

/**
 * Writes example user data into the user table in the database. Must only be used in tests.
 */
const applyUserSeed = async (): Promise<void> => {
  await client.user.createMany({
    data: [
      {
        email: "jane.doe@example.com",
        name: "Jane Doe",
        avatar: "data:image/jpeg;base64,U29tZSBmYW5jeSBhdmF0YXIgaW1hZ2U=",
        phone: "+123456789",
        accessRights: 255,
        subscriptions: 0,
        credentialID: "exampleCredentialID",
        credentialPublicKey: "exampleCredentialPublicKey",
        counter: 0,
      },

      {
        email: "john.doe@example.com",
        name: "John Doe",
        phone: "+234567890",
        accessRights: GENERAL_ACCESS,
        subscriptions: STOCK_UPDATE_MESSAGE,
        credentialID: "anotherExampleCredentialID",
        credentialPublicKey: "anotherExampleCredentialPublicKey",
        counter: 0,
      },
    ],
  });
};

/**
 * Writes example watchlist data into the watchlist table in the database. Must only be used in tests.
 */
const applyWatchlistSeed = async (): Promise<void> => {
  await client.watchlist.create({
    data: {
      name: "Favorites",
      email: "jane.doe@example.com",
      stocks: {
        connect: [{ ticker: "exampleAAPL" }, { ticker: "exampleTSM" }],
      },
      subscribed: true,
    },
  });
  await client.watchlist.create({
    data: {
      name: "Fævørites",
      email: "jane.doe@example.com",
      stocks: {
        connect: [{ ticker: "exampleNOVO B" }, { ticker: "exampleORSTED" }],
      },
    },
  });
};

/**
 * Writes example portfolio data into the portfolio table in the database. Must only be used in tests.
 */
const applyPortfolioSeed = async (): Promise<void> => {
  await client.portfolio.create({
    data: {
      name: "My Portfolio",
      email: "jane.doe@example.com",
      currency: "USD",
      stocks: {
        create: [
          { amount: 120, stock: { connect: { ticker: "exampleAAPL" } } },
          { amount: 90, stock: { connect: { ticker: "exampleTSM" } } },
        ],
      },
    },
  });
  await client.portfolio.create({
    data: {
      name: "Min portefølje",
      email: "jane.doe@example.com",
      currency: "DKK",
      stocks: {
        create: [
          { amount: 800, stock: { connect: { ticker: "exampleNOVO B" } } },
          { amount: 100, stock: { connect: { ticker: "exampleORSTED" } } },
        ],
      },
    },
  });
};

/**
 * Clears and writes example data into the tables in the database. Must only be used in tests.
 */
const applyPostgresSeeds = async (): Promise<void> => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Refusing to apply seed when not in a test environment");
  }

  await client.$queryRaw`TRUNCATE TABLE "Stock", "User", "Watchlist", "_StockToWatchlist", "Portfolio", "StocksInPortfolios" RESTART IDENTITY CASCADE`;

  await applyStockSeed();
  await applyUserSeed();
  await applyWatchlistSeed();
  await applyPortfolioSeed();
};

export default applyPostgresSeeds;
