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
 * The stock last fetch dates related to the data providers.
 */
export const dataProviderLastFetch: Record<Exclude<DataProvider, "sustainalytics">, keyof Stock> = {
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