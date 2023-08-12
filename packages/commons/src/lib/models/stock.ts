import { Currency } from "../Currency";
import { Country } from "../geo/Country";
import { Industry } from "../gecs/Industry";
import { MSCIESGRating } from "../ratings/MSCI";
import { Size } from "../stylebox/Size";
import { Style } from "../stylebox/Style";
import { OmitFunctions } from "../OmitFunctions";

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
   * The stock’s industry as part of the Morningstar Global Equity Classification Structure.
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
   * The currency the stock is traded in.
   */
  currency: Currency | null;
  /**
   * The stock’s price at the end of the previous trading day.
   */
  lastClose: number | null;
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
   * The market capitalization of the stock.
   */
  marketCap: number | null;
  /**
   * The lower bound of the 52-week range of the stock’s price.
   */
  low52w: number | null;
  /**
   * The upper bound of the 52-week range of the stock’s price.
   */
  high52w: number | null;
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
   * The consensus of analysts’ opinions on the stock.
   */
  analystConsensus: number | null;
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
   * The Reuters Instrument Code of the stock, used by Refinitiv.
   */
  ric: string | null;
  /**
   * The date and time of the last fetch from Refinitiv.
   */
  refinitivLastFetch: Date | null;
  /**
   * Refinitiv’s ESG score of the stock.
   */
  refinitivESGScore: number | null;
  /**
   * Refinitiv’s Emissions rating of the stock.
   */
  refinitivEmissions: number | null;
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
  industry: null,
  size: null,
  style: null,
  morningstarID: null,
  morningstarLastFetch: null,
  starRating: null,
  dividendYieldPercent: null,
  priceEarningRatio: null,
  currency: null,
  lastClose: null,
  morningstarFairValue: null,
  marketCap: null,
  low52w: null,
  high52w: null,
  marketScreenerID: null,
  marketScreenerLastFetch: null,
  analystConsensus: null,
  analystCount: null,
  analystTargetPrice: null,
  msciID: null,
  msciLastFetch: null,
  msciESGRating: null,
  msciTemperature: null,
  ric: null,
  refinitivLastFetch: null,
  refinitivESGScore: null,
  refinitivEmissions: null,
  spID: null,
  spLastFetch: null,
  spESGScore: null,
  sustainalyticsID: null,
  sustainalyticsESGRisk: null,
  description: null,
};
