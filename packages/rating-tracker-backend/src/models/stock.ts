import { Entity, Schema } from "redis-om";
import {
  Country,
  Currency,
  Industry,
  MSCIESGRating,
  Size,
  Stock as CommonsStock,
  Style,
} from "rating-tracker-commons";

/**
 * A stock, with core information like its ticker, name, ISIN, country, industry, etc., financial information like its
 * dividend yield, P/E ratio, market cap, etc., identifiers for external data providers, as well as financial and ESG
 * ratings.
 */
export class Stock extends CommonsStock {
  /**
   * Creates a new {@link Stock} from either its Redis entity or a partial Stock object.
   *
   * @param {StockEntity | Partial<Stock>} stock The Redis entity of the stock or a partial Stock object.
   */
  constructor(stock: StockEntity | Partial<Stock>) {
    super();
    if (stock instanceof StockEntity) {
      this.ticker = stock.entityId; // The ticker is used as the entity’s ID
    } else {
      this.ticker = stock.ticker;
    }
    this.name = stock.name;
    this.isin = stock.isin;
    if (stock.country != null) this.country = stock.country as Country;
    if (stock.industry != null) this.industry = stock.industry as Industry;
    if (stock.size != null) this.size = stock.size as Size;
    if (stock.style != null) this.style = stock.style as Style;
    if (stock.morningstarId != null) this.morningstarId = stock.morningstarId;
    if (stock.morningstarLastFetch != null)
      this.morningstarLastFetch = stock.morningstarLastFetch;
    if (stock.starRating != null) this.starRating = stock.starRating;
    if (stock.dividendYieldPercent != null)
      this.dividendYieldPercent = stock.dividendYieldPercent;
    if (stock.priceEarningRatio != null)
      this.priceEarningRatio = stock.priceEarningRatio;
    if (stock.currency != null) this.currency = stock.currency as Currency;
    if (stock.lastClose != null) this.lastClose = stock.lastClose;
    if (stock.morningstarFairValue != null)
      this.morningstarFairValue = stock.morningstarFairValue;
    if (stock.marketCap != null) this.marketCap = stock.marketCap;
    if (stock.low52w != null) this.low52w = stock.low52w;
    if (stock.high52w != null) this.high52w = stock.high52w;
    if (stock.marketScreenerId != null)
      this.marketScreenerId = stock.marketScreenerId;
    if (stock.marketScreenerLastFetch != null)
      this.marketScreenerLastFetch = stock.marketScreenerLastFetch;
    if (stock.analystConsensus != null)
      this.analystConsensus = stock.analystConsensus;
    if (stock.analystCount != null) this.analystCount = stock.analystCount;
    if (stock.analystTargetPrice != null)
      this.analystTargetPrice = stock.analystTargetPrice;
    if (stock.msciId != null) this.msciId = stock.msciId;
    if (stock.msciLastFetch != null) this.msciLastFetch = stock.msciLastFetch;
    if (stock.msciESGRating != null)
      this.msciESGRating = stock.msciESGRating as MSCIESGRating;
    if (stock.msciTemperature != null)
      this.msciTemperature = stock.msciTemperature;
    if (stock.ric != null) this.ric = stock.ric;
    if (stock.refinitivLastFetch != null)
      this.refinitivLastFetch = stock.refinitivLastFetch;
    if (stock.refinitivESGScore != null)
      this.refinitivESGScore = stock.refinitivESGScore;
    if (stock.refinitivEmissions != null)
      this.refinitivEmissions = stock.refinitivEmissions;
    if (stock.spId != null) this.spId = stock.spId;
    if (stock.spLastFetch != null) this.spLastFetch = stock.spLastFetch;
    if (stock.spESGScore != null) this.spESGScore = stock.spESGScore;
    if (stock.sustainalyticsId != null)
      this.sustainalyticsId = stock.sustainalyticsId;
    if (stock.sustainalyticsESGRisk != null)
      this.sustainalyticsESGRisk = stock.sustainalyticsESGRisk;
    if (stock.description != null) this.description = stock.description;
  }
}

/**
 * A Redis entity of a {@link Stock}.
 */
export interface StockEntity {
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
  country: string;
  /**
   * The stock’s International Securities Identification Number.
   */
  isin: string;
  /**
   * The stock’s industry as part of the Morningstar Global Equity Classification Structure.
   */
  industry: string;
  /**
   * The stock’s size as part of the Morningstar Style Box. Based on its market capitalization and geographic area.
   */
  size: string;
  /**
   * The stock’s style as part of the Morningstar Style Box. Based on the value and growth characteristics of a company.
   */
  style: string;
  /**
   * Morningstar’s identifier for the stock.
   */
  morningstarId: string;
  /**
   * The date and time of the last fetch from Morningstar.
   */
  morningstarLastFetch: Date;
  /**
   * Morningstar’s star rating of the stock.
   */
  starRating: number;
  /**
   * The dividend yield of the stock, in percent.
   */
  dividendYieldPercent: number;
  /**
   * The price-to-earnings ratio of the stock.
   */
  priceEarningRatio: number;
  /**
   * The currency the stock is traded in.
   */
  currency: string;
  /**
   * The stock’s price at the end of the previous trading day.
   */
  lastClose: number;
  /**
   * Morningstar’s fair value estimate for the stock.
   */
  morningstarFairValue: number;
  /**
   * The market capitalization of the stock.
   */
  marketCap: number;
  /**
   * The lower bound of the 52-week range of the stock’s price.
   */
  low52w: number;
  /**
   * The upper bound of the 52-week range of the stock’s price.
   */
  high52w: number;
  /**
   * Market Screener’s identifier for the stock.
   */
  marketScreenerId: string;
  /**
   * The date and time of the last fetch from Market Screener.
   */
  marketScreenerLastFetch: Date;
  /**
   * The consensus of analysts’ opinions on the stock.
   */
  analystConsensus: number;
  /**
   * The number of analysts that cover the stock.
   */
  analystCount: number;
  /**
   * The average target price of analysts for the stock.
   */
  analystTargetPrice: number;
  /**
   * MSCI’s identifier for the stock.
   */
  msciId: string;
  /**
   * The date and time of the last fetch from MSCI.
   */
  msciLastFetch: Date;
  /**
   * MSCI’s ESG rating of the stock.
   */
  msciESGRating: string;
  /**
   * MSCI’s Implied Temperature rise of the stock.
   */
  msciTemperature: number;
  /**
   * The Reuters Instrument Code of the stock, used by Refinitiv.
   */
  ric: string;
  /**
   * The date and time of the last fetch from Refinitiv.
   */
  refinitivLastFetch: Date;
  /**
   * Refinitiv’s ESG score of the stock.
   */
  refinitivESGScore: number;
  /**
   * Refinitiv’s Emissions rating of the stock.
   */
  refinitivEmissions: number;
  /**
   * Standard & Poor’s identifier for the stock.
   */
  spId: number;
  /**
   * The date and time of the last fetch from Standard & Poor’s.
   */
  spLastFetch: Date;
  /**
   * Standard & Poor’s ESG score of the stock.
   */
  spESGScore: number;
  /**
   * Morningstar Sustainalytics’ identifier for the stock.
   */
  sustainalyticsId: string;
  /**
   * Sustainalytics’ ESG risk of the stock.
   */
  sustainalyticsESGRisk: number;
  /**
   * A description of the company.
   */
  description: string;
}

export class StockEntity extends Entity {}

/**
 * A Redis schema of a {@link StockEntity}.
 * @see {@link Stock}
 */
export const stockSchema = new Schema(StockEntity, {
  name: { type: "text", sortable: true },
  country: { type: "string" },
  isin: { type: "string" },
  industry: { type: "string" },
  size: { type: "string" },
  style: { type: "string" },
  morningstarId: { type: "string" },
  morningstarLastFetch: { type: "date" },
  starRating: { type: "number" },
  dividendYieldPercent: { type: "number" },
  priceEarningRatio: { type: "number" },
  currency: { type: "string" },
  lastClose: { type: "number" },
  morningstarFairValue: { type: "number" },
  marketCap: { type: "number" },
  low52w: { type: "number" },
  high52w: { type: "number" },
  marketScreenerId: { type: "string" },
  marketScreenerLastFetch: { type: "date" },
  analystConsensus: { type: "number" },
  analystCount: { type: "number" },
  analystTargetPrice: { type: "number" },
  msciId: { type: "string" },
  msciLastFetch: { type: "date" },
  msciESGRating: { type: "string" },
  msciTemperature: { type: "number" },
  ric: { type: "string" },
  refinitivLastFetch: { type: "date" },
  refinitivESGScore: { type: "number" },
  refinitivEmissions: { type: "number" },
  spId: { type: "number" },
  spLastFetch: { type: "date" },
  spESGScore: { type: "number" },
  sustainalyticsId: { type: "string" },
  sustainalyticsESGRisk: { type: "number" },
  description: { type: "string" },
});
