import { Currency } from "../Currency.js";
import { Country } from "../geo/Country.js";
import { Industry } from "../gecs/Industry.js";
import { MSCIESGRating } from "../ratings/MSCI.js";
import { Size } from "../stylebox/Size.js";
import { Style } from "../stylebox/Style.js";

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
  industry?: Industry;
  /**
   * The stock’s size as part of the Morningstar Style Box. Based on its market capitalization and geographic area.
   */
  size?: Size;
  /**
   * The stock’s style as part of the Morningstar Style Box. Based on the value and growth characteristics of a company.
   */
  style?: Style;
  /**
   * Morningstar’s identifier for the stock.
   */
  morningstarId?: string;
  /**
   * The date and time of the last fetch from Morningstar.
   */
  morningstarLastFetch?: Date;
  /**
   * Morningstar’s star rating of the stock.
   */
  starRating?: number;
  /**
   * The dividend yield of the stock, in percent.
   */
  dividendYieldPercent?: number;
  /**
   * The price-to-earnings ratio of the stock.
   */
  priceEarningRatio?: number;
  /**
   * The currency the stock is traded in.
   */
  currency?: Currency;
  /**
   * The stock’s price at the end of the previous trading day.
   */
  lastClose?: number;
  /**
   * Morningstar’s fair value estimate for the stock.
   */
  morningstarFairValue?: number;
  /**
   * The market capitalization of the stock.
   */
  marketCap?: number;
  /**
   * The lower bound of the 52-week range of the stock’s price.
   */
  low52w?: number;
  /**
   * The upper bound of the 52-week range of the stock’s price.
   */
  high52w?: number;
  /**
   * Market Screener’s identifier for the stock.
   */
  marketScreenerId?: string;
  /**
   * The date and time of the last fetch from Market Screener.
   */
  marketScreenerLastFetch?: Date;
  /**
   * The consensus of analysts’ opinions on the stock.
   */
  analystConsensus?: number;
  /**
   * The number of analysts that cover the stock.
   */
  analystCount?: number;
  /**
   * The average target price of analysts for the stock.
   */
  analystTargetPrice?: number;
  /**
   * MSCI’s identifier for the stock.
   */
  msciId?: string;
  /**
   * The date and time of the last fetch from MSCI.
   */
  msciLastFetch?: Date;
  /**
   * MSCI’s ESG rating of the stock.
   */
  msciESGRating?: MSCIESGRating;
  /**
   * MSCI’s Implied Temperature rise of the stock.
   */
  msciTemperature?: number;
  /**
   * The Reuters Instrument Code of the stock, used by Refinitiv.
   */
  ric?: string;
  /**
   * The date and time of the last fetch from Refinitiv.
   */
  refinitivLastFetch?: Date;
  /**
   * Refinitiv’s ESG score of the stock.
   */
  refinitivESGScore?: number;
  /**
   * Refinitiv’s Emissions rating of the stock.
   */
  refinitivEmissions?: number;
  /**
   * Standard & Poor’s identifier for the stock.
   */
  spId?: number;
  /**
   * The date and time of the last fetch from Standard & Poor’s.
   */
  spLastFetch?: Date;
  /**
   * Standard & Poor’s ESG score of the stock.
   */
  spESGScore?: number;
  /**
   * Morningstar Sustainalytics’ identifier for the stock.
   */
  sustainalyticsId?: string;
  /**
   * Sustainalytics’ ESG risk of the stock.
   */
  sustainalyticsESGRisk?: number;
  /**
   * A description of the company.
   */
  description?: string;

  /**
   * Creates a new stock from partial stock information.
   *
   * @param {Partial<Stock>} stock The partial stock information.
   */
  constructor(stock?: Partial<Stock>) {
    if (stock) {
      Object.assign(this, stock);
    }
  }

  /**
   * Provides a score for the stock based on its Morningstar star rating.
   *
   * @returns {number} The score, ranging from -1 (1 star) to 1 (5 stars).
   */
  private getStarRatingScore(): number | undefined {
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
        return undefined;
    }
  }

  /**
   * Provides a score for the stock based on its Morningstar Fair Value Estimate.
   *
   * @returns {number} The score, ranging from -1 (premium of 50 percent or more) to 1 (discount of 50 percent or more).
   */
  private getMorningstarFairValueScore(): number | undefined {
    const percentageToLastClose = this.getPercentageToLastClose(
      "morningstarFairValue"
    );
    return percentageToLastClose !== undefined
      ? -percentageToLastClose / 50
      : undefined;
  }

  /**
   * Provides a score for the stock based on its analyst consensus.
   *
   * @returns {number} The score, ranging from -1 (consensus of 0) to 1 (consensus of 10).
   */
  private getAnalystConsensusScore(): number | undefined {
    if (this.analystCount && this.analystConsensus !== undefined) {
      if (this.analystCount >= 10) {
        return (this.analystConsensus - 5) / 5;
      } else {
        return (this.analystCount / 10) * ((this.analystConsensus - 5) / 5);
      }
    } else {
      return undefined;
    }
  }

  /**
   * Provides a score for the stock based on its analyst target price.
   *
   * @returns {number} The score, ranging from -1 (premium of 50 percent or more) to 1 (discount of 50 percent or more).
   */
  private getAnalystTargetPriceScore(): number | undefined {
    const percentageToLastClose =
      this.getPercentageToLastClose("analystTargetPrice");
    if (this.analystCount && percentageToLastClose !== undefined) {
      if (this.analystCount >= 10) {
        return -percentageToLastClose / 50;
      } else {
        return (this.analystCount / 10) * (-percentageToLastClose / 50);
      }
    } else {
      return undefined;
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

    if (starRatingScore !== undefined) {
      financialScore += starRatingScore;
      count += 1;
    }
    if (morningstarFairValueScore !== undefined) {
      financialScore += Math.min(morningstarFairValueScore, 1);
      count += 1;
    }
    if (analystConsensusScore !== undefined) {
      financialScore += analystConsensusScore;
      count += 1;
    }
    if (analystTargetPriceScore !== undefined) {
      financialScore += Math.min(analystTargetPriceScore, 1);
      count += 1;
    }

    return financialScore / Math.max(3, count);
  }

  /**
   * Provides a score for the stock based on its MSCI ESG rating.
   *
   * @returns {number} The score, ranging from -2 (CCC) to 1 (AAA).
   */
  private getMSCIESGRatingScore(): number | undefined {
    if (!this.msciESGRating) {
      return undefined;
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
  private getMSCITemperatureScore(): number | undefined {
    return this.msciTemperature ? 2 - this.msciTemperature : undefined;
  }

  /**
   * Provides a score for the stock based on its Refinitiv ESG score.
   *
   * @returns {number} The score, ranging from -1 (0) to 1 (100).
   */
  private getRefinitivESGScore(): number | undefined {
    return this.refinitivESGScore !== undefined
      ? (this.refinitivESGScore - 50) / 50
      : undefined;
  }

  /**
   * Provides a score for the stock based on its Refinitiv Emissions rating.
   *
   * @returns {number} The score, ranging from -1 (0) to 1 (100).
   */
  private getRefinitivEmissionsScore(): number | undefined {
    return this.refinitivEmissions !== undefined
      ? (this.refinitivEmissions - 50) / 50
      : undefined;
  }

  /**
   * Provides a score for the stock based on its Standard & Poor’s ESG score.
   *
   * @returns {number} The score, ranging from -1 (0) to 1 (100).
   */
  private getSPESGScore(): number | undefined {
    return this.spESGScore !== undefined
      ? (this.spESGScore - 50) / 50
      : undefined;
  }

  /**
   * Provides a score for the stock based on its Sustainalytics ESG Risk score.
   *
   * @returns {number} The score, ranging from -1 (40) to 1 (0).
   */
  private getSustainalyticsESGRiskScore(): number | undefined {
    return this.sustainalyticsESGRisk !== undefined
      ? 1 - this.sustainalyticsESGRisk / 20
      : undefined;
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

    if (msciESGRatingScore !== undefined) {
      esgScore += msciESGRatingScore;
      count += 1;
    }
    if (msciTemperatureScore !== undefined) {
      esgScore += msciTemperatureScore;
      count += 1;
    }
    if (refinitivESGScore !== undefined) {
      esgScore += refinitivESGScore;
      count += 1;
    }
    if (refinitivEmissionsScore !== undefined) {
      esgScore += refinitivEmissionsScore;
      count += 1;
    }
    if (spESGScore !== undefined) {
      esgScore += spESGScore;
      count += 1;
    }
    if (sustainalyticsESGRiskScore !== undefined) {
      esgScore += sustainalyticsESGRiskScore;
      count += 1;
    }

    return esgScore / Math.max(4, count);
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
  public getPercentageToLastClose(
    attribute: "morningstarFairValue" | "analystTargetPrice"
  ): number | undefined {
    const result =
      this[attribute] && this.lastClose
        ? 100 * (this.lastClose / this[attribute] - 1)
        : undefined;
    return Number.isNaN(result) ? undefined : result;
  }
}
