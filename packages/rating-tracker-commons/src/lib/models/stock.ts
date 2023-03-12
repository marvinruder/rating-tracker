import { Currency } from "../Currency.js";
import { Country } from "../geo/Country.js";
import { Industry } from "../gecs/Industry.js";
import { MSCIESGRating } from "../ratings/MSCI.js";
import { Size } from "../stylebox/Size.js";
import { Style } from "../stylebox/Style.js";
import { OmitFunctions } from "../OmitFunctions.js";

/**
 * A stock, with core information like its ticker, name, ISIN, country, industry, etc., financial information like its
 * dividend yield, P/E ratio, market cap, etc., identifiers for external data providers, as well as financial and ESG
 * ratings.
 */
export class Stock {
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

  /**
   * Creates a new stock from stock information.
   *
   * @param {OmitFunctions<Stock>} stock The stock information.
   */
  constructor(stock: OmitFunctions<Stock>) {
    Object.assign(this, stock);
  }

  /**
   * Provides a score for the stock based on its Morningstar star rating.
   *
   * @returns {number} The score, ranging from -1 (1 star) to 1 (5 stars).
   */
  private getStarRatingScore(): number | null {
    switch (this.starRating) {
      case 1:
        return -1;
      case 2:
        return -0.5;
      case 4:
        return 0.5;
      case 5:
        return 1;
      case 3:
      default:
        return null;
    }
  }

  /**
   * Provides a score for the stock based on its Morningstar Fair Value Estimate.
   *
   * @returns {number} The score, ranging from -1 (premium of 50 percent or more) to 1 (discount of 50 percent or more).
   */
  private getMorningstarFairValueScore(): number | null {
    const percentageToLastClose = this.getPercentageToLastClose("morningstarFairValue");
    return percentageToLastClose !== null ? -percentageToLastClose / 50 : null;
  }

  /**
   * Provides a score for the stock based on its analyst consensus.
   *
   * @returns {number} The score, ranging from -1 (consensus of 0) to 1 (consensus of 10).
   */
  private getAnalystConsensusScore(): number | null {
    if (this.analystCount && this.analystConsensus !== null) {
      if (this.analystCount >= 10) {
        return (this.analystConsensus - 5) / 5;
      } else {
        return (this.analystCount / 10) * ((this.analystConsensus - 5) / 5);
      }
    } else {
      return null;
    }
  }

  /**
   * Provides a score for the stock based on its analyst target price.
   *
   * @returns {number} The score, ranging from -1 (premium of 50 percent or more) to 1 (discount of 50 percent or more).
   */
  private getAnalystTargetPriceScore(): number | null {
    const percentageToLastClose = this.getPercentageToLastClose("analystTargetPrice");
    if (this.analystCount && percentageToLastClose !== null) {
      if (this.analystCount >= 10) {
        return -percentageToLastClose / 50;
      } else {
        return (this.analystCount / 10) * (-percentageToLastClose / 50);
      }
    } else {
      return null;
    }
  }

  /**
   * Provides a score for the stock based on its financial ratings.
   *
   * @returns {number} The score, ranging from -1 (poor) to 1 (excellent).
   */
  public getFinancialScore(): number {
    const starRatingScore = this.getStarRatingScore();
    const morningstarFairValueScore = this.getMorningstarFairValueScore();
    const analystConsensusScore = this.getAnalystConsensusScore();
    const analystTargetPriceScore = this.getAnalystTargetPriceScore();

    let financialScore = 0;
    let count = 0;

    if (starRatingScore !== null) {
      financialScore += starRatingScore;
      count += 1;
    }
    if (morningstarFairValueScore !== null) {
      financialScore += Math.min(morningstarFairValueScore, 1);
      count += 1;
    }
    if (analystConsensusScore !== null) {
      financialScore += analystConsensusScore;
      count += 1;
    }
    if (analystTargetPriceScore !== null) {
      financialScore += Math.min(analystTargetPriceScore, 1);
      count += 1;
    }

    return count ? Math.max(financialScore / Math.max(3, count), -1) : 0;
  }

  /**
   * Provides a score for the stock based on its MSCI ESG rating.
   *
   * @returns {number} The score, ranging from -2 (CCC) to 1 (AAA).
   */
  private getMSCIESGRatingScore(): number | null {
    if (this.msciESGRating === null) {
      return null;
    }
    switch (this.msciESGRating) {
      case "AAA":
        return 1;
      case "AA":
        return 0.5;
      case "A":
        return 0;
      case "BBB":
        return -0.5;
      case "BB":
        return -1;
      case "B":
        return -1.5;
      case "CCC":
        return -2;
    }
  }

  /**
   * Provides a score for the stock based on its MSCI Implied Temperature Rise.
   *
   * @returns {number} The score, ranging from -2 (4°C) to 1 (1°C).
   */
  private getMSCITemperatureScore(): number | null {
    return this.msciTemperature !== null ? Math.min(2 - this.msciTemperature, 1) : null;
  }

  /**
   * Provides a score for the stock based on its Refinitiv ESG score.
   *
   * @returns {number} The score, ranging from -1 (0) to 1 (100).
   */
  private getRefinitivESGScore(): number | null {
    return this.refinitivESGScore !== null ? (this.refinitivESGScore - 50) / 50 : null;
  }

  /**
   * Provides a score for the stock based on its Refinitiv Emissions rating.
   *
   * @returns {number} The score, ranging from -1 (0) to 1 (100).
   */
  private getRefinitivEmissionsScore(): number | null {
    return this.refinitivEmissions !== null ? (this.refinitivEmissions - 50) / 50 : null;
  }

  /**
   * Provides a score for the stock based on its Standard & Poor’s ESG score.
   *
   * @returns {number} The score, ranging from -1 (0) to 1 (100).
   */
  private getSPESGScore(): number | null {
    return this.spESGScore !== null ? (this.spESGScore - 50) / 50 : null;
  }

  /**
   * Provides a score for the stock based on its Sustainalytics ESG Risk score.
   *
   * @returns {number} The score, ranging from -1 (40) to 1 (0).
   */
  private getSustainalyticsESGRiskScore(): number | null {
    return this.sustainalyticsESGRisk !== null ? 1 - this.sustainalyticsESGRisk / 20 : null;
  }

  /**
   * Provides a score for the stock based on its ESG ratings.
   *
   * @returns {number} The score, ranging from -1 (poor) to 1 (excellent).
   */
  public getESGScore(): number {
    const msciESGRatingScore = this.getMSCIESGRatingScore();
    const msciTemperatureScore = this.getMSCITemperatureScore();
    const refinitivESGScore = this.getRefinitivESGScore();
    const refinitivEmissionsScore = this.getRefinitivEmissionsScore();
    const spESGScore = this.getSPESGScore();
    const sustainalyticsESGRiskScore = this.getSustainalyticsESGRiskScore();

    let esgScore = 0;
    let count = 0;

    if (msciESGRatingScore !== null) {
      esgScore += msciESGRatingScore;
      count += 1;
    }
    if (msciTemperatureScore !== null) {
      esgScore += msciTemperatureScore;
      count += 1;
    }
    if (refinitivESGScore !== null) {
      esgScore += refinitivESGScore;
      count += 1;
    }
    if (refinitivEmissionsScore !== null) {
      esgScore += refinitivEmissionsScore;
      count += 1;
    }
    if (spESGScore !== null) {
      esgScore += spESGScore;
      count += 1;
    }
    if (sustainalyticsESGRiskScore !== null) {
      esgScore += sustainalyticsESGRiskScore;
      count += 1;
    }

    return count ? Math.max(esgScore / Math.max(4, count), -1) : 0;
  }

  /**
   * Provides a score for the stock based on both its financial and ESG ratings.
   *
   * @returns {number} The score, ranging from -1 (poor) to 1 (excellent).
   */
  public getTotalScore(): number {
    return this.getFinancialScore() * 0.5 + this.getESGScore() * 0.5;
  }

  /**
   * Calculates the percentage difference (= premium or discount) between the stock's last close and the given
   * attribute.
   *
   * @param {"morningstarFairValue" | "analystTargetPrice"} attribute The attribute to compare to the last close.
   * @returns {number} The percentage difference.
   */
  public getPercentageToLastClose(attribute: "morningstarFairValue" | "analystTargetPrice"): number | null {
    const result =
      this[attribute] /* this also prevents division by zero */ && this.lastClose
        ? 100 * (this.lastClose / this[attribute] - 1)
        : null;
    return result;
  }
}

/**
 * An object containing null values for all optional attributes of a stock. Can be passed to the Stock constructor via
 * `{ ...optionalStockValuesNull, … }`.
 */
export const optionalStockValuesNull: OmitFunctions<Omit<Stock, "ticker" | "name" | "isin" | "country">> = {
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
