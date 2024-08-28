import type { OmitDynamicAttributesStock, Stock } from "@rating-tracker/commons";
import { analystRatingArray, msciESGRatingArray } from "@rating-tracker/commons";

/**
 * This helper class provides methods to calculate dynamically generated attributes for stocks.
 */
class DynamicStockAttributeHelper {
  /**
   * Provides a score for the stock based on its Morningstar star rating.
   * @param stock The stock.
   * @returns The score, ranging from -1 (1 star) to 1 (5 stars). `null`, if no star rating exists.
   */
  static #getStarRatingScore = (stock: OmitDynamicAttributesStock): number | null => {
    switch (stock.starRating) {
      case 1:
        return -1;
      case 2:
        return -0.5;
      case 3:
        return 0;
      case 4:
        return 0.5;
      case 5:
        return 1;
      default:
        return null;
    }
  };

  /**
   * Provides a score for the stock based on its Morningstar Fair Value Estimate.
   * @param stock The stock.
   * @returns The score, ranging from -1 (premium of 50 percent or more) to 1 (discount of 50 percent or more). `null`,
   *          if no Morningstar Fair Value Estimate or last close price exists.
   */
  static #getMorningstarFairValueScore = (stock: OmitDynamicAttributesStock): number | null => {
    const percentageToLastClose = this.#getPercentageToLastClose(stock, "morningstarFairValue");
    return percentageToLastClose !== null ? -percentageToLastClose / 50 : null;
  };

  /**
   * Provides a score for the stock based on its analyst consensus.
   * @param stock The stock.
   * @returns The score, ranging from -1 (consensus of Sell) to 1 (consensus of Buy). `null`, if no analyst consensus
   *          exists, or if the analyst count is 0. If less than 10 analysts have rated the stock, the score is adjusted
   *          based on the number of analysts.
   */
  static #getAnalystConsensusScore = (stock: OmitDynamicAttributesStock): number | null => {
    if (stock.analystCount && stock.analystConsensus !== null) {
      const rawAnalystConsensusScore = 0.5 * analystRatingArray.indexOf(stock.analystConsensus) - 1;
      if (stock.analystCount >= 10) return rawAnalystConsensusScore;
      else return rawAnalystConsensusScore * (stock.analystCount / 10);
    } else return null;
  };

  /**
   * Provides a score for the stock based on its analyst target price.
   * @param stock The stock.
   * @returns The score, ranging from -1 (premium of 50 percent or more) to 1 (discount of 50 percent or more). `null`,
   *          if no analyst target price or last close price exists, or if the analyst count is 0.
   */
  static #getAnalystTargetPriceScore = (stock: OmitDynamicAttributesStock): number | null => {
    const percentageToLastClose = this.#getPercentageToLastClose(stock, "analystTargetPrice");
    if (stock.analystCount && percentageToLastClose !== null) {
      if (stock.analystCount >= 10) {
        return -percentageToLastClose / 50;
      } else {
        return (stock.analystCount / 10) * (-percentageToLastClose / 50);
      }
    } else {
      return null;
    }
  };

  /**
   * Provides a score for the stock based on its financial ratings.
   * @param stock The stock.
   * @returns The score, ranging from -1 (poor) to 1 (excellent).
   */
  static #getFinancialScore = (stock: OmitDynamicAttributesStock): number => {
    const starRatingScore = this.#getStarRatingScore(stock);
    const morningstarFairValueScore = this.#getMorningstarFairValueScore(stock);
    const analystConsensusScore = this.#getAnalystConsensusScore(stock);
    const analystTargetPriceScore = this.#getAnalystTargetPriceScore(stock);

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
  };

  /**
   * Provides a score for the stock based on its MSCI ESG rating.
   * @param stock The stock.
   * @returns The score, ranging from -2 (CCC) to 1 (AAA). `null`, if no MSCI ESG rating exists.
   */
  static #getMSCIESGRatingScore = (stock: OmitDynamicAttributesStock): number | null => {
    if (stock.msciESGRating === null) {
      return null;
    }
    return -0.5 * msciESGRatingArray.indexOf(stock.msciESGRating) + 1;
  };

  /**
   * Provides a score for the stock based on its MSCI Implied Temperature Rise.
   * @param stock The stock.
   * @returns The score, ranging from -2 (4°C) to 1 (1°C (lol, as if)). `null`, if no MSCI Implied Temperature Rise
   *          exists.
   */
  static #getMSCITemperatureScore = (stock: OmitDynamicAttributesStock): number | null => {
    return stock.msciTemperature !== null ? Math.min(2 - stock.msciTemperature, 1) : null;
  };

  /**
   * Provides a score for the stock based on its LSEG ESG Score.
   * @param stock The stock.
   * @returns The score, ranging from -1 (0) to 1 (100). `null`, if no LSEG ESG Score exists.
   */
  static #getLSEGESGScore = (stock: OmitDynamicAttributesStock): number | null => {
    return stock.lsegESGScore !== null ? (stock.lsegESGScore - 50) / 50 : null;
  };

  /**
   * Provides a score for the stock based on its LSEG Emissions rating.
   * @param stock The stock.
   * @returns The score, ranging from -1 (0) to 1 (100). `null`, if no LSEG Emissions rating exists.
   */
  static #getLSEGEmissionsScore = (stock: OmitDynamicAttributesStock): number | null => {
    return stock.lsegEmissions !== null ? (stock.lsegEmissions - 50) / 50 : null;
  };

  /**
   * Provides a score for the stock based on its Standard & Poor’s ESG score.
   * @param stock The stock.
   * @returns The score, ranging from -1 (0) to 1 (100). `null`, if no Standard & Poor’s ESG score exists.
   */
  static #getSPESGScore = (stock: OmitDynamicAttributesStock): number | null => {
    return stock.spESGScore !== null ? (stock.spESGScore - 50) / 50 : null;
  };

  /**
   * Provides a score for the stock based on its Sustainalytics ESG Risk score.
   * @param stock The stock.
   * @returns The score, ranging from -1 (40) to 1 (0). `null`, if no Sustainalytics ESG Risk score exists.
   */
  static #getSustainalyticsESGRiskScore = (stock: OmitDynamicAttributesStock): number | null => {
    return stock.sustainalyticsESGRisk !== null ? 1 - stock.sustainalyticsESGRisk / 20 : null;
  };

  /**
   * Provides a score for the stock based on its ESG ratings.
   * @param stock The stock.
   * @returns The score, ranging from -1 (poor) to 1 (excellent).
   */
  static #getESGScore = (stock: OmitDynamicAttributesStock): number => {
    const msciESGRatingScore = this.#getMSCIESGRatingScore(stock);
    const msciTemperatureScore = this.#getMSCITemperatureScore(stock);
    const lsegESGScore = this.#getLSEGESGScore(stock);
    const lsegEmissionsScore = this.#getLSEGEmissionsScore(stock);
    const spESGScore = this.#getSPESGScore(stock);
    const sustainalyticsESGRiskScore = this.#getSustainalyticsESGRiskScore(stock);

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
    if (lsegESGScore !== null) {
      esgScore += lsegESGScore;
      count += 1;
    }
    if (lsegEmissionsScore !== null) {
      esgScore += lsegEmissionsScore;
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
  };

  /**
   * Provides a score for the stock based on both its financial and ESG ratings. The harmonic mean of both numbers is
   * used so that a stock has to perform well in both financial and ESG ratings to obtain a good total score.
   * @param stock The stock.
   * @returns The score, ranging from -1 (poor) to 1 (excellent).
   */
  static #getTotalScore = (stock: OmitDynamicAttributesStock): number => {
    const financialScore = this.#getFinancialScore(stock);
    const esgScore = this.#getESGScore(stock);

    return financialScore > 0 && esgScore > 0
      ? (2 * (financialScore * esgScore)) / (financialScore + esgScore)
      : Math.min(financialScore, esgScore);
  };

  /**
   * Calculates the percentage difference (= premium or discount) between the stock's last close and the given
   * attribute.
   * @param stock The stock.
   * @param attribute The attribute to compare to the last close.
   * @returns The percentage difference. `null`, if no such attribute exists.
   */
  static #getPercentageToLastClose = (
    stock: OmitDynamicAttributesStock,
    attribute: "morningstarFairValue" | "analystTargetPrice",
  ): number | null => {
    const result =
      stock[attribute] /* this also prevents division by zero */ && stock.lastClose
        ? 100 * (stock.lastClose / stock[attribute] - 1)
        : null;
    return result;
  };

  /**
   * Calculates the position of the stock’s last close price in the 52-week range.
   * @param stock  The stock.
   * @returns The position of the stock’s last close price in the 52-week range. `null`, if no 52 week range or last
   *          close price is available.
   */
  static #getPositionIn52w = (stock: OmitDynamicAttributesStock): number | null => {
    return stock.low52w && stock.high52w && stock.lastClose
      ? (stock.lastClose - stock.low52w) / (stock.high52w - stock.low52w)
      : null;
  };

  /**
   * Returns an object containing dynamically generated attributes for a given stock data object.
   * @param stock The stock data to generated attributes for.
   * @returns An object containing the dynamically generated attributes.
   */
  static dynamicStockAttributes = (
    stock: OmitDynamicAttributesStock,
  ): Omit<Stock, keyof OmitDynamicAttributesStock> => ({
    financialScore: this.#getFinancialScore(stock),
    esgScore: this.#getESGScore(stock),
    totalScore: this.#getTotalScore(stock),
    morningstarFairValuePercentageToLastClose: this.#getPercentageToLastClose(stock, "morningstarFairValue"),
    analystTargetPricePercentageToLastClose: this.#getPercentageToLastClose(stock, "analystTargetPrice"),
    positionIn52w: this.#getPositionIn52w(stock),
  });

  /**
   * Adds dynamically generated attributes to a given stock data object.
   * @param stock The stock data to add the generated attributes to.
   * @returns The stock containing the dynamically generated attributes.
   */
  static addDynamicAttributesToStockData = (stock: OmitDynamicAttributesStock): Stock => ({
    ...stock,
    ...this.dynamicStockAttributes(stock),
  });
}

export default DynamicStockAttributeHelper;
