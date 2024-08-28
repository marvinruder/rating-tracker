import type { Industry } from "./gecs/Industry";
import type { Country } from "./geo/Country";
import type { AnalystRating } from "./ratings/AnalystRating";
import type { MSCIESGRating } from "./ratings/MSCI";
import type { Size } from "./stylebox/Size";
import type { Style } from "./stylebox/Style";

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
  analystConsensusMin?: AnalystRating;
  analystConsensusMax?: AnalystRating;
  analystCountMin?: number;
  analystCountMax?: number;
  analystTargetDiffMin?: number;
  analystTargetDiffMax?: number;
  msciESGRatingMin?: MSCIESGRating;
  msciESGRatingMax?: MSCIESGRating;
  msciTemperatureMin?: number;
  msciTemperatureMax?: number;
  lsegESGScoreMin?: number;
  lsegESGScoreMax?: number;
  lsegEmissionsMin?: number;
  lsegEmissionsMax?: number;
  spESGScoreMin?: number;
  spESGScoreMax?: number;
  sustainalyticsESGRiskMin?: number;
  sustainalyticsESGRiskMax?: number;
  countries?: Country[];
  industries?: Industry[];
  size?: Size;
  style?: Style;
};
