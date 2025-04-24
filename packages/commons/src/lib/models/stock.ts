import type { Currency } from "../Currency";
import type { Industry } from "../gecs/Industry";
import type { Country } from "../geo/Country";
import type { OmitFunctions } from "../OmitFunctions";
import type { AnalystRating } from "../ratings/AnalystRating";
import type { MSCIESGRating } from "../ratings/MSCI";
import type { Size } from "../stylebox/Size";
import type { Style } from "../stylebox/Style";

/**
 * A stock, with core information like its ticker, name, ISIN, country, industry, etc., financial information like its
 * dividend yield, P/E ratio, market cap, etc., identifiers for external data providers, as well as financial and ESG
 * ratings.
 */
export type Stock = {
  /**
   * The stock’s ticker symbol.
   */
  ticker: string;
  /**
   * The stock’s name.
   */
  name: string;
  /**
   * The country of the company’s operational headquarters.
   */
  country: Country;
  /**
   * The stock’s International Securities Identification Number.
   */
  isin: string;
  /**
   * The main industry the company operates in, as part of the Morningstar Global Equity Classification Structure.
   */
  industry: Industry | null;
  /**
   * The stock’s size as part of the Morningstar Style Box. Based on its market capitalization and geographic area.
   */
  size: Size | null;
  /**
   * The stock’s style as part of the Morningstar Style Box. Based on the value and growth characteristics of a company.
   */
  style: Style | null;
  /**
   * The stock’s score based on its financial ratings.
   */
  financialScore: number;
  /**
   * The stock’s score based on its ESG ratings.
   */
  esgScore: number;
  /**
   * The stock’s score based on both its financial and ESG ratings.
   */
  totalScore: number;
  /**
   * The date and time of the last fetch from Yahoo Finance.
   */
  yahooLastFetch: Date | null;
  /**
   * The currency the stock is traded in.
   */
  currency: Currency | null;
  /**
   * The stock’s price at the end of the previous trading day.
   */
  lastClose: number | null;
  /**
   * The lower bound of the 52-week range of the stock’s price.
   */
  low52w: number | null;
  /**
   * The upper bound of the 52-week range of the stock’s price.
   */
  high52w: number | null;
  /**
   * The stock’s historical prices during the last year.
   */
  prices1y: number[] | null;
  /**
   * The stock’s historical prices during the last month.
   */
  prices1mo: number[] | null;
  /**
   * Morningstar’s identifier for the stock.
   */
  morningstarID: string | null;
  /**
   * The date and time of the last fetch from Morningstar.
   */
  morningstarLastFetch: Date | null;
  /**
   * Morningstar’s star rating of the stock.
   */
  starRating: number | null;
  /**
   * The dividend yield of the stock, in percent.
   */
  dividendYieldPercent: number | null;
  /**
   * The price-to-earnings ratio of the stock.
   */
  priceEarningRatio: number | null;
  /**
   * Morningstar’s fair value estimate for the stock.
   */
  morningstarFairValue: number | null;
  /**
   * The percentage difference between Morningstar’s fair value estimate and the last close price.
   *
   * Is computed dynamically at every database update.
   */
  morningstarFairValuePercentageToLastClose: number | null;
  /**
   * The market capitalization of the stock, in United States dollars.
   */
  marketCap: number | null;
  /**
   * The position of the stock’s last close price in the 52-week range.
   *
   * Is computed dynamically at every database update.
   */
  positionIn52w: number | null;
  /**
   * Market Screener’s identifier for the stock.
   */
  marketScreenerID: string | null;
  /**
   * The date and time of the last fetch from Market Screener.
   */
  marketScreenerLastFetch: Date | null;
  /**
   * The consensus of analysts’ opinions on the stock, that is, the mean value of all analyst ratings.
   */
  analystConsensus: AnalystRating | null;
  /**
   * The ratings of analysts for the stock.
   */
  analystRatings: Record<AnalystRating, number> | null;
  /**
   * The number of analysts that cover the stock.
   */
  analystCount: number | null;
  /**
   * The average target price of analysts for the stock.
   */
  analystTargetPrice: number | null;
  /**
   * The percentage difference between the average target price of analysts and the last close price.
   *
   * Is computed dynamically at every database update.
   */
  analystTargetPricePercentageToLastClose: number | null;
  /**
   * MSCI’s identifier for the stock.
   */
  msciID: string | null;
  /**
   * The date and time of the last fetch from MSCI.
   */
  msciLastFetch: Date | null;
  /**
   * MSCI’s ESG rating of the stock.
   */
  msciESGRating: MSCIESGRating | null;
  /**
   * MSCI’s Implied Temperature rise of the stock.
   */
  msciTemperature: number | null;
  /**
   * The Reuters Instrument Code of the stock, used by LSEG Data & Analytics.
   */
  ric: string | null;
  /**
   * The date and time of the last fetch from LSEG Data & Analytics.
   */
  lsegLastFetch: Date | null;
  /**
   * LSEG’s ESG score of the stock.
   */
  lsegESGScore: number | null;
  /**
   * LSEG’s Emissions rating of the stock.
   */
  lsegEmissions: number | null;
  /**
   * Standard & Poor’s identifier for the stock.
   */
  spID: number | null;
  /**
   * The date and time of the last fetch from Standard & Poor’s.
   */
  spLastFetch: Date | null;
  /**
   * Standard & Poor’s ESG score of the stock.
   */
  spESGScore: number | null;
  /**
   * Morningstar Sustainalytics’ identifier for the stock.
   */
  sustainalyticsID: string | null;
  /**
   * Sustainalytics’ ESG risk of the stock.
   */
  sustainalyticsESGRisk: number | null;
  /**
   * A description of the company.
   */
  description: string | null;
};

/**
 * A stock associated with an amount of a specified currency.
 */
export type WeightedStock = Stock & {
  /**
   * The amount of currency associated with the stock.
   */
  amount: number;
};

/**
 * A stub of a stock, provided by the Yahoo Finance API.
 */
export type YahooStockStub = {
  /**
   * The stock’s ticker symbol.
   */
  ticker: Stock["ticker"];
  /**
   * The stock’s name.
   */
  name: Stock["name"];
  /**
   * The stock’s industry as part of the Morningstar Global Equity Classification Structure.
   */
  industry: Stock["industry"] | null;
  /**
   * A URL to the stock’s logo.
   */
  logoUrl: string | null;
};

export type OmitDynamicAttributesStock = Omit<
  Stock,
  | "financialScore"
  | "esgScore"
  | "totalScore"
  | "morningstarFairValuePercentageToLastClose"
  | "analystTargetPricePercentageToLastClose"
  | "positionIn52w"
>;

/**
 * An object containing null values for all optional attributes of a stock. Can be passed to the Stock constructor via
 * `{ ...optionalStockValuesNull, … }`.
 */
export const optionalStockValuesNull: OmitFunctions<
  Omit<OmitDynamicAttributesStock, "ticker" | "name" | "isin" | "country">
> = {
  yahooLastFetch: null,
  currency: null,
  lastClose: null,
  low52w: null,
  high52w: null,
  prices1y: [],
  prices1mo: [],
  industry: null,
  size: null,
  style: null,
  morningstarID: null,
  morningstarLastFetch: null,
  starRating: null,
  dividendYieldPercent: null,
  priceEarningRatio: null,
  morningstarFairValue: null,
  marketCap: null,
  marketScreenerID: null,
  marketScreenerLastFetch: null,
  analystConsensus: null,
  analystRatings: null,
  analystCount: null,
  analystTargetPrice: null,
  msciID: null,
  msciLastFetch: null,
  msciESGRating: null,
  msciTemperature: null,
  ric: null,
  lsegLastFetch: null,
  lsegESGScore: null,
  lsegEmissions: null,
  spID: null,
  spLastFetch: null,
  spESGScore: null,
  sustainalyticsID: null,
  sustainalyticsESGRisk: null,
  description: null,
};

/**
 * Parses a stock from a JSON object.
 * @param stock The stock JSON object to parse.
 * @returns The parsed stock.
 */
export const parseStock = (
  stock: Omit<
    Stock,
    { [K in keyof Stock]: Stock[K] extends Date | null ? K : never }[keyof Stock] | "analystRatings"
  > & {
    [K in { [K in keyof Stock]: Stock[K] extends Date | null ? K : never }[keyof Stock]]: string | null;
  } & {
    analystRatings: Partial<Record<AnalystRating, number>> | null; // colinhacks/zod#3334
  },
): Stock => ({
  ...stock,
  analystRatings: stock.analystRatings as Stock["analystRatings"],
  yahooLastFetch: stock.yahooLastFetch ? new Date(stock.yahooLastFetch) : null,
  morningstarLastFetch: stock.morningstarLastFetch ? new Date(stock.morningstarLastFetch) : null,
  marketScreenerLastFetch: stock.marketScreenerLastFetch ? new Date(stock.marketScreenerLastFetch) : null,
  msciLastFetch: stock.msciLastFetch ? new Date(stock.msciLastFetch) : null,
  lsegLastFetch: stock.lsegLastFetch ? new Date(stock.lsegLastFetch) : null,
  spLastFetch: stock.spLastFetch ? new Date(stock.spLastFetch) : null,
});

/**
 * Parses a stock from a JSON object.
 * @param stock The stock JSON object to parse.
 * @returns The parsed stock.
 */
export const parseWeightedStock = (
  stock: Omit<
    WeightedStock,
    | { [K in keyof WeightedStock]: WeightedStock[K] extends Date | null ? K : never }[keyof WeightedStock]
    | "analystRatings"
  > & {
    [K in { [K in keyof WeightedStock]: WeightedStock[K] extends Date | null ? K : never }[keyof WeightedStock]]:
      | string
      | null;
  } & {
    analystRatings: Partial<Record<AnalystRating, number>> | null; // colinhacks/zod#3334
  },
): WeightedStock => ({
  ...stock,
  analystRatings: stock.analystRatings as WeightedStock["analystRatings"],
  yahooLastFetch: stock.yahooLastFetch ? new Date(stock.yahooLastFetch) : null,
  morningstarLastFetch: stock.morningstarLastFetch ? new Date(stock.morningstarLastFetch) : null,
  marketScreenerLastFetch: stock.marketScreenerLastFetch ? new Date(stock.marketScreenerLastFetch) : null,
  msciLastFetch: stock.msciLastFetch ? new Date(stock.msciLastFetch) : null,
  lsegLastFetch: stock.lsegLastFetch ? new Date(stock.lsegLastFetch) : null,
  spLastFetch: stock.spLastFetch ? new Date(stock.spLastFetch) : null,
});
