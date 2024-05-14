import type { Stock } from "./models/stock";
import {
  fetchLSEGEndpointPath,
  fetchMarketScreenerEndpointPath,
  fetchMorningstarEndpointPath,
  fetchMSCIEndpointPath,
  fetchSPEndpointPath,
  fetchSustainalyticsEndpointPath,
} from "./paths/fetch";

/**
 * An array of all data providers.
 */
export const dataProviderArray = ["morningstar", "marketScreener", "msci", "lseg", "sp", "sustainalytics"] as const;

/**
 * A data provider to fetch information from.
 */
export type DataProvider = (typeof dataProviderArray)[number];

/**
 * An array of data providers from which stocks are fetched individually.
 */
export const individualDataProviderArray = [
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
 * Checks if a string is a valid data provider.
 * @param dataProvider The data provider to check.
 * @returns True if the string is a valid data provider.
 */
export function isDataProvider(dataProvider: string): dataProvider is DataProvider {
  return dataProviderArray.includes(dataProvider as DataProvider);
}

/**
 * Checks if a data provider is a valid individual data provider.
 * @param dataProvider The data provider to check.
 * @returns True if the data provider is a valid individual data provider.
 */
export function isIndividualDataProvider(dataProvider: DataProvider): dataProvider is IndividualDataProvider {
  return individualDataProviderArray.includes(dataProvider as IndividualDataProvider);
}

/**
 * Checks if a data provider is a valid bulk data provider.
 * @param dataProvider The data provider to check.
 * @returns True if the data provider is a valid bulk data provider.
 */
export function isBulkDataProvider(dataProvider: DataProvider): dataProvider is BulkDataProvider {
  return bulkDataProviderArray.includes(dataProvider as BulkDataProvider);
}

/**
 * A record of names for each data provider.
 */
export const dataProviderName: Record<DataProvider, string> = {
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
  { [K in keyof Stock]: Stock[K] extends Date ? K : never }[keyof Stock]
> = {
  morningstar: "morningstarLastFetch",
  marketScreener: "marketScreenerLastFetch",
  msci: "msciLastFetch",
  lseg: "lsegLastFetch",
  sp: "spLastFetch",
};

/**
 * The endpoints of the data providers.
 */
export const dataProviderEndpoints: Record<DataProvider, string> = {
  morningstar: fetchMorningstarEndpointPath,
  marketScreener: fetchMarketScreenerEndpointPath,
  msci: fetchMSCIEndpointPath,
  lseg: fetchLSEGEndpointPath,
  sp: fetchSPEndpointPath,
  sustainalytics: fetchSustainalyticsEndpointPath,
};

/**
 * The Time-To-Live (TTL) of the information fetched from the data providers, in seconds.
 */
export const dataProviderTTL: Record<DataProvider, number> = {
  morningstar: 60 * 60 * 12, // 12 hours
  marketScreener: 60 * 60 * 12, // 12 hours
  msci: 60 * 60 * 24 * 7, // 7 days
  lseg: 60 * 60 * 24 * 7, // 7 days
  sp: 60 * 60 * 24 * 7, // 7 days
  sustainalytics: 60 * 60 * 24 * 7, // 7 days
};
