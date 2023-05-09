import { Country, Industry, MSCIESGRating, Size, Style } from "@rating-tracker/commons";

/**
 * An object containing all possible values for filtering stocks.
 */
export type StockFilter = {
  totalScoreMin?: number;
  totalScoreMax?: number;
  financialScoreMin?: number;
  financialScoreMax?: number;
  esgScoreMin?: number;
  esgScoreMax?: number;
  dividendYieldPercentMin?: number;
  dividendYieldPercentMax?: number;
  priceEarningRatioMin?: number;
  priceEarningRatioMax?: number;
  starRatingMin?: number;
  starRatingMax?: number;
  morningstarFairValueDiffMin?: number;
  morningstarFairValueDiffMax?: number;
  analystConsensusMin?: number;
  analystConsensusMax?: number;
  analystCountMin?: number;
  analystCountMax?: number;
  analystTargetDiffMin?: number;
  analystTargetDiffMax?: number;
  msciESGRatingMin?: MSCIESGRating;
  msciESGRatingMax?: MSCIESGRating;
  msciTemperatureMin?: number;
  msciTemperatureMax?: number;
  refinitivESGScoreMin?: number;
  refinitivESGScoreMax?: number;
  refinitivEmissionsMin?: number;
  refinitivEmissionsMax?: number;
  spESGScoreMin?: number;
  spESGScoreMax?: number;
  sustainalyticsESGRiskMin?: number;
  sustainalyticsESGRiskMax?: number;
  countries?: Country[];
  industries?: Industry[];
  size?: Size;
  style?: Style;
};
