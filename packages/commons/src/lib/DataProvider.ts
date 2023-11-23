import { Stock } from "./models/stock";
import {
  fetchMSCIEndpointPath,
  fetchMarketScreenerEndpointPath,
  fetchMorningstarEndpointPath,
  fetchRefinitivEndpointPath,
  fetchSPEndpointPath,
  fetchSustainalyticsEndpointPath,
} from "./paths/fetch";

/**
 * An array of all data providers.
 */
export const dataProviderArray = [
  "morningstar",
  "marketScreener",
  "msci",
  "refinitiv",
  "sp",
  "sustainalytics",
] as const;

/**
 * A data provider to fetch information from.
 */
export type DataProvider = (typeof dataProviderArray)[number];

/**
 * A data provider from which stocks are fetched individually.
 */
export type IndividualDataProvider = Exclude<DataProvider, "sustainalytics">;

/**
 * A data provider from which stocks are fetched in bulk.
 */
export type BulkDataProvider = "sustainalytics";

/**
 * Checks if a string is a valid data provider.
 *
 * @param {string} dataProvider The data provider to check.
 * @returns {boolean} True if the string is a valid data provider.
 */
export function isDataProvider(dataProvider: string): dataProvider is DataProvider {
  return dataProviderArray.includes(dataProvider as DataProvider);
}

/**
 * A record of names for each data provider.
 */
export const dataProviderName: Record<DataProvider, string> = {
  morningstar: "Morningstar",
  marketScreener: "Market Screener",
  msci: "MSCI",
  refinitiv: "Refinitiv",
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
  refinitiv: "ric",
  sp: "spID",
  sustainalytics: "sustainalyticsID",
};

/**
 * The stock last fetch date properties related to the data providers.
 */
export const dataProviderLastFetch: Record<
  IndividualDataProvider,
  "morningstarLastFetch" | "marketScreenerLastFetch" | "msciLastFetch" | "refinitivLastFetch" | "spLastFetch"
> = {
  morningstar: "morningstarLastFetch",
  marketScreener: "marketScreenerLastFetch",
  msci: "msciLastFetch",
  refinitiv: "refinitivLastFetch",
  sp: "spLastFetch",
};

/**
 * The endpoints of the data providers.
 */
export const dataProviderEndpoints: Record<DataProvider, string> = {
  morningstar: fetchMorningstarEndpointPath,
  marketScreener: fetchMarketScreenerEndpointPath,
  msci: fetchMSCIEndpointPath,
  refinitiv: fetchRefinitivEndpointPath,
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
  refinitiv: 60 * 60 * 24 * 7, // 7 days
  sp: 60 * 60 * 24 * 7, // 7 days
  sustainalytics: 60 * 60 * 24 * 7, // 7 days
};
