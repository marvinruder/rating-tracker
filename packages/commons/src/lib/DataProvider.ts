import type { Stock } from "./models/stock";
import {
  fetchLSEGEndpointSuffix,
  fetchMarketScreenerEndpointSuffix,
  fetchMorningstarEndpointSuffix,
  fetchMSCIEndpointSuffix,
  fetchSPEndpointSuffix,
  fetchSustainalyticsEndpointSuffix,
  fetchYahooEndpointSuffix,
} from "./paths/fetch";

/**
 * An array of all data providers.
 */
export const dataProviderArray = [
  "yahoo",
  "morningstar",
  "marketScreener",
  "msci",
  "lseg",
  "sp",
  "sustainalytics",
] as const;

/**
 * A data provider to fetch information from.
 */
export type DataProvider = (typeof dataProviderArray)[number];

/**
 * An array of data providers from which stocks are fetched individually.
 */
export const individualDataProviderArray = [
  "yahoo",
  "morningstar",
  "marketScreener",
  "msci",
  "lseg",
  "sp",
] as const satisfies DataProvider[];

/**
 * An array of data providers which provide information for many stocks in one response.
 */
export const bulkDataProviderArray = ["sustainalytics"] as const satisfies DataProvider[];

/**
 * A data provider from which stocks are fetched individually.
 */
export type IndividualDataProvider = (typeof individualDataProviderArray)[number];

/**
 * A data provider from which stocks are fetched in bulk.
 */
export type BulkDataProvider = (typeof bulkDataProviderArray)[number];

/**
 * Checks if an entity is a valid data provider.
 * @param entity The entity to check.
 * @returns True if the entity is a valid data provider.
 */
export function isDataProvider(entity: unknown): entity is DataProvider {
  return dataProviderArray.includes(entity as DataProvider);
}

/**
 * Checks if an entity is a valid individual data provider.
 * @param entity The entity to check.
 * @returns True if the entity is a valid individual data provider.
 */
export function isIndividualDataProvider(entity: unknown): entity is IndividualDataProvider {
  return individualDataProviderArray.includes(entity as IndividualDataProvider);
}

/**
 * Checks if an entity is a valid bulk data provider.
 * @param entity The entity to check.
 * @returns True if the entity is a valid bulk data provider.
 */
export function isBulkDataProvider(entity: unknown): entity is BulkDataProvider {
  return bulkDataProviderArray.includes(entity as BulkDataProvider);
}

/**
 * A record of names for each data provider.
 */
export const dataProviderName: Record<DataProvider, string> = {
  yahoo: "Yahoo Finance",
  morningstar: "Morningstar",
  marketScreener: "Market Screener",
  msci: "MSCI",
  lseg: "LSEG Data & Analytics",
  sp: "Standard & Poor’s",
  sustainalytics: "Sustainalytics",
};

/**
 * The stock ID properties related to the data providers.
 */
export const dataProviderID: Record<DataProvider, keyof Stock> = {
  yahoo: "ticker",
  morningstar: "morningstarID",
  marketScreener: "marketScreenerID",
  msci: "msciID",
  lseg: "ric",
  sp: "spID",
  sustainalytics: "sustainalyticsID",
};

/**
 * The stock last fetch date properties related to the data providers.
 */
export const dataProviderLastFetch: Record<
  IndividualDataProvider,
  { [K in keyof Stock]: Stock[K] extends Date | null ? K : never }[keyof Stock]
> = {
  yahoo: "yahooLastFetch",
  morningstar: "morningstarLastFetch",
  marketScreener: "marketScreenerLastFetch",
  msci: "msciLastFetch",
  lseg: "lsegLastFetch",
  sp: "spLastFetch",
};

/**
 * The stock properties fetched from the data providers.
 */
export const dataProviderProperties: Record<DataProvider, (keyof Stock)[]> = {
  yahoo: ["currency", "lastClose", "low52w", "high52w", "prices1y", "prices1mo"],
  morningstar: [
    "industry",
    "size",
    "style",
    "starRating",
    "dividendYieldPercent",
    "priceEarningRatio",
    "morningstarFairValue",
    "marketCap",
    "description",
  ],
  marketScreener: ["analystConsensus", "analystRatings", "analystCount", "analystTargetPrice"],
  msci: ["msciESGRating", "msciTemperature"],
  lseg: ["lsegESGScore", "lsegEmissions"],
  sp: ["spESGScore"],
  sustainalytics: ["sustainalyticsESGRisk"],
};

/**
 * The endpoints of the data providers.
 */
export const dataProviderEndpoints: Record<DataProvider, string> = {
  yahoo: fetchYahooEndpointSuffix,
  morningstar: fetchMorningstarEndpointSuffix,
  marketScreener: fetchMarketScreenerEndpointSuffix,
  msci: fetchMSCIEndpointSuffix,
  lseg: fetchLSEGEndpointSuffix,
  sp: fetchSPEndpointSuffix,
  sustainalytics: fetchSustainalyticsEndpointSuffix,
};

/**
 * The Time-To-Live (TTL) of the information fetched from the data providers, in seconds.
 */
export const dataProviderTTL: Record<DataProvider, number> = {
  yahoo: 60 * 60 * 12, // 12 hours
  morningstar: 60 * 60 * 12, // 12 hours
  marketScreener: 60 * 60 * 12, // 12 hours
  msci: 60 * 60 * 24 * 7, // 7 days
  lseg: 60 * 60 * 24 * 7, // 7 days
  sp: 60 * 60 * 24 * 7, // 7 days
  sustainalytics: 60 * 60 * 24 * 7, // 7 days
};
