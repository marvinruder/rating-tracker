import { OmitDynamicAttributesStock, Stock } from "rating-tracker-commons";

/**
 * Provides a score for the stock based on its Morningstar star rating.
 *
 * @param {Stock} stock The stock.
 * @returns {number | null} The score, ranging from -1 (1 star) to 1 (5 stars). `null`, if no star rating exists.
 */
const getStarRatingScore = (stock: OmitDynamicAttributesStock): number | null => {
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
 *
 * @param {Stock} stock The stock.
 * @returns {number | null} The score, ranging from -1 (premium of 50 percent or more) to 1 (discount of 50 percent or
 * more). `null`, if no Morningstar Fair Value Estimate or last close price exists.
 */
const getMorningstarFairValueScore = (stock: OmitDynamicAttributesStock): number | null => {
  const percentageToLastClose = getPercentageToLastClose(stock, "morningstarFairValue");
  return percentageToLastClose !== null ? -percentageToLastClose / 50 : null;
};

/**
 * Provides a score for the stock based on its analyst consensus.
 *
 * @param {Stock} stock The stock.
 * @returns {number | null} The score, ranging from -1 (consensus of 0) to 1 (consensus of 10). `null`, if no analyst
 * consensus exists, or if the analyst count is 0.
 */
const getAnalystConsensusScore = (stock: OmitDynamicAttributesStock): number | null => {
  if (stock.analystCount && stock.analystConsensus !== null) {
    if (stock.analystCount >= 10) {
      return (stock.analystConsensus - 5) / 5;
    } else {
      return (stock.analystCount / 10) * ((stock.analystConsensus - 5) / 5);
    }
  } else {
    return null;
  }
};

/**
 * Provides a score for the stock based on its analyst target price.
 *
 * @param {Stock} stock The stock.
 * @returns {number | null} The score, ranging from -1 (premium of 50 percent or more) to 1 (discount of 50 percent or
 * more). `null`, if no analyst target price or last close price exists, or if the analyst count is 0.
 */
const getAnalystTargetPriceScore = (stock: OmitDynamicAttributesStock): number | null => {
  const percentageToLastClose = getPercentageToLastClose(stock, "analystTargetPrice");
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
 *
 * @param {Stock} stock The stock.
 * @returns {number} The score, ranging from -1 (poor) to 1 (excellent).
 */
const getFinancialScore = (stock: OmitDynamicAttributesStock): number => {
  const starRatingScore = getStarRatingScore(stock);
  const morningstarFairValueScore = getMorningstarFairValueScore(stock);
  const analystConsensusScore = getAnalystConsensusScore(stock);
  const analystTargetPriceScore = getAnalystTargetPriceScore(stock);

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
 *
 * @param {Stock} stock The stock.
 * @returns {number | null} The score, ranging from -2 (CCC) to 1 (AAA). `null`, if no MSCI ESG rating exists.
 */
const getMSCIESGRatingScore = (stock: OmitDynamicAttributesStock): number | null => {
  if (stock.msciESGRating === null) {
    return null;
  }
  switch (stock.msciESGRating) {
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
};

/**
 * Provides a score for the stock based on its MSCI Implied Temperature Rise.
 *
 * @param {Stock} stock The stock.
 * @returns {number | null} The score, ranging from -2 (4°C) to 1 (1°C (lol, as if)). `null`, if no MSCI Implied
 * Temperature Rise exists.
 */
const getMSCITemperatureScore = (stock: OmitDynamicAttributesStock): number | null => {
  return stock.msciTemperature !== null ? Math.min(2 - stock.msciTemperature, 1) : null;
};

/**
 * Provides a score for the stock based on its Refinitiv ESG score.
 *
 * @param {Stock} stock The stock.
 * @returns {number | null} The score, ranging from -1 (0) to 1 (100). `null`, if no Refinitiv ESG score exists.
 */
const getRefinitivESGScore = (stock: OmitDynamicAttributesStock): number | null => {
  return stock.refinitivESGScore !== null ? (stock.refinitivESGScore - 50) / 50 : null;
};

/**
 * Provides a score for the stock based on its Refinitiv Emissions rating.
 *
 * @param {Stock} stock The stock.
 * @returns {number | null} The score, ranging from -1 (0) to 1 (100). `null`, if no Refinitiv Emissions rating exists.
 */
const getRefinitivEmissionsScore = (stock: OmitDynamicAttributesStock): number | null => {
  return stock.refinitivEmissions !== null ? (stock.refinitivEmissions - 50) / 50 : null;
};

/**
 * Provides a score for the stock based on its Standard & Poor’s ESG score.
 *
 * @param {Stock} stock The stock.
 * @returns {number | null} The score, ranging from -1 (0) to 1 (100). `null`, if no Standard & Poor’s ESG score exists.
 */
const getSPESGScore = (stock: OmitDynamicAttributesStock): number | null => {
  return stock.spESGScore !== null ? (stock.spESGScore - 50) / 50 : null;
};

/**
 * Provides a score for the stock based on its Sustainalytics ESG Risk score.
 *
 * @param {Stock} stock The stock.
 * @returns {number | null} The score, ranging from -1 (40) to 1 (0). `null`, if no Sustainalytics ESG Risk score
 * exists.
 */
const getSustainalyticsESGRiskScore = (stock: OmitDynamicAttributesStock): number | null => {
  return stock.sustainalyticsESGRisk !== null ? 1 - stock.sustainalyticsESGRisk / 20 : null;
};

/**
 * Provides a score for the stock based on its ESG ratings.
 *
 * @param {Stock} stock The stock.
 * @returns {number} The score, ranging from -1 (poor) to 1 (excellent).
 */
const getESGScore = (stock: OmitDynamicAttributesStock): number => {
  const msciESGRatingScore = getMSCIESGRatingScore(stock);
  const msciTemperatureScore = getMSCITemperatureScore(stock);
  const refinitivESGScore = getRefinitivESGScore(stock);
  const refinitivEmissionsScore = getRefinitivEmissionsScore(stock);
  const spESGScore = getSPESGScore(stock);
  const sustainalyticsESGRiskScore = getSustainalyticsESGRiskScore(stock);

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
};

/**
 * Provides a score for the stock based on both its financial and ESG ratings.
 *
 * @param {Stock} stock The stock.
 * @returns {number} The score, ranging from -1 (poor) to 1 (excellent).
 */
const getTotalScore = (stock: OmitDynamicAttributesStock): number => {
  return getFinancialScore(stock) * 0.5 + getESGScore(stock) * 0.5;
};

/**
 * Calculates the percentage difference (= premium or discount) between the stock's last close and the given
 * attribute.
 *
 * @param {Stock} stock The stock.
 * @param {"morningstarFairValue" | "analystTargetPrice"} attribute The attribute to compare to the last close.
 * @returns {number | null} The percentage difference. `null`, if no such attribute exists.
 */
const getPercentageToLastClose = (
  stock: OmitDynamicAttributesStock,
  attribute: "morningstarFairValue" | "analystTargetPrice"
): number | null => {
  const result =
    stock[attribute] /* this also prevents division by zero */ && stock.lastClose
      ? 100 * (stock.lastClose / stock[attribute] - 1)
      : null;
  return result;
};

/**
 * Calculates the position of the stock’s last close price in the 52-week range.
 *
 * @param {Stock} stock  The stock.
 * @returns {number | null} The position of the stock’s last close price in the 52-week range. `null`, if no 52 week
 * range or last close price is available.
 */
const getPositionIn52w = (stock: OmitDynamicAttributesStock): number | null => {
  return stock.low52w && stock.high52w && stock.lastClose
    ? (stock.lastClose - stock.low52w) / (stock.high52w - stock.low52w)
    : null;
};

/**
 * Returns an object containing dynamically generated attributes for a given stock data object.
 *
 * @param {OmitDynamicAttributesStock} stock The stock data to generated attributes for.
 * @returns {Omit<Stock, keyof OmitDynamicAttributesStock>} An object containing the dynamically generated attributes.
 */
export const dynamicStockAttributes = (
  stock: OmitDynamicAttributesStock
): Omit<Stock, keyof OmitDynamicAttributesStock> => ({
  financialScore: getFinancialScore(stock),
  esgScore: getESGScore(stock),
  totalScore: getTotalScore(stock),
  morningstarFairValuePercentageToLastClose: getPercentageToLastClose(stock, "morningstarFairValue"),
  analystTargetPricePercentageToLastClose: getPercentageToLastClose(stock, "analystTargetPrice"),
  positionIn52w: getPositionIn52w(stock),
});

/**
 * Adds dynamically generated attributes to a given stock data object.
 *
 * @param {OmitDynamicAttributesStock} stock The stock data to add the generated attributes to.
 * @returns {Stock} The stock containing the dynamically generated attributes.
 */
export const addDynamicAttributesToStockData = (stock: OmitDynamicAttributesStock): Stock => ({
  ...stock,
  ...dynamicStockAttributes(stock),
});
