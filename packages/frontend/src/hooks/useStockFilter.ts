import type {
  AnalystRating,
  Country,
  Industry,
  MSCIESGRating,
  Size,
  StockFilter,
  Style,
} from "@rating-tracker/commons";
import { useMemo } from "react";
import { useSearchParams } from "react-router";

/**
 * Derives the stock filters from the URL search parameters.
 * @returns A stock filter object.
 */
const useStockFilter = (): StockFilter => {
  const [searchParams] = useSearchParams();

  /**
   * Computes the stock filter values from the URL search parameters.
   * @returns A stock filter object.
   */
  const computeFilterValues = (): StockFilter => {
    const filter: StockFilter = {};

    if (searchParams.has("totalScoreMin")) filter.totalScoreMin = +searchParams.get("totalScoreMin")!;
    if (searchParams.has("totalScoreMax")) filter.totalScoreMax = +searchParams.get("totalScoreMax")!;
    if (searchParams.has("financialScoreMin")) filter.financialScoreMin = +searchParams.get("financialScoreMin")!;
    if (searchParams.has("financialScoreMax")) filter.financialScoreMax = +searchParams.get("financialScoreMax")!;
    if (searchParams.has("esgScoreMin")) filter.esgScoreMin = +searchParams.get("esgScoreMin")!;
    if (searchParams.has("esgScoreMax")) filter.esgScoreMax = +searchParams.get("esgScoreMax")!;

    if (searchParams.has("dividendYieldPercentMin"))
      filter.dividendYieldPercentMin = +searchParams.get("dividendYieldPercentMin")!;
    if (searchParams.has("dividendYieldPercentMax"))
      filter.dividendYieldPercentMax = +searchParams.get("dividendYieldPercentMax")!;
    if (searchParams.has("priceEarningRatioMin"))
      filter.priceEarningRatioMin = +searchParams.get("priceEarningRatioMin")!;
    if (searchParams.has("priceEarningRatioMax"))
      filter.priceEarningRatioMax = +searchParams.get("priceEarningRatioMax")!;
    if (searchParams.has("marketCapMin")) filter.marketCapMin = +searchParams.get("marketCapMin")!;
    if (searchParams.has("marketCapMax")) filter.marketCapMax = +searchParams.get("marketCapMax")!;

    if (searchParams.has("starRatingMin")) filter.starRatingMin = +searchParams.get("starRatingMin")!;
    if (searchParams.has("starRatingMax")) filter.starRatingMax = +searchParams.get("starRatingMax")!;
    if (searchParams.has("morningstarFairValueDiffMin"))
      filter.morningstarFairValueDiffMin = +searchParams.get("morningstarFairValueDiffMin")!;
    if (searchParams.has("morningstarFairValueDiffMax"))
      filter.morningstarFairValueDiffMax = +searchParams.get("morningstarFairValueDiffMax")!;
    if (searchParams.has("analystConsensusMin"))
      filter.analystConsensusMin = searchParams.get("analystConsensusMin") as AnalystRating;
    if (searchParams.has("analystConsensusMax"))
      filter.analystConsensusMax = searchParams.get("analystConsensusMax") as AnalystRating;
    if (searchParams.has("analystCountMin")) filter.analystCountMin = +searchParams.get("analystCountMin")!;
    if (searchParams.has("analystCountMax")) filter.analystCountMax = +searchParams.get("analystCountMax")!;
    if (searchParams.has("analystTargetDiffMin"))
      filter.analystTargetDiffMin = +searchParams.get("analystTargetDiffMin")!;
    if (searchParams.has("analystTargetDiffMax"))
      filter.analystTargetDiffMax = +searchParams.get("analystTargetDiffMax")!;

    if (searchParams.has("msciESGRatingMin"))
      filter.msciESGRatingMin = searchParams.get("msciESGRatingMin") as MSCIESGRating;
    if (searchParams.has("msciESGRatingMax"))
      filter.msciESGRatingMax = searchParams.get("msciESGRatingMax") as MSCIESGRating;
    if (searchParams.has("msciTemperatureMin")) filter.msciTemperatureMin = +searchParams.get("msciTemperatureMin")!;
    if (searchParams.has("msciTemperatureMax")) filter.msciTemperatureMax = +searchParams.get("msciTemperatureMax")!;
    if (searchParams.has("lsegESGScoreMin")) filter.lsegESGScoreMin = +searchParams.get("lsegESGScoreMin")!;
    if (searchParams.has("lsegESGScoreMax")) filter.lsegESGScoreMax = +searchParams.get("lsegESGScoreMax")!;
    if (searchParams.has("lsegEmissionsMin")) filter.lsegEmissionsMin = +searchParams.get("lsegEmissionsMin")!;
    if (searchParams.has("lsegEmissionsMax")) filter.lsegEmissionsMax = +searchParams.get("lsegEmissionsMax")!;
    if (searchParams.has("spESGScoreMin")) filter.spESGScoreMin = +searchParams.get("spESGScoreMin")!;
    if (searchParams.has("spESGScoreMax")) filter.spESGScoreMax = +searchParams.get("spESGScoreMax")!;
    if (searchParams.has("sustainalyticsESGRiskMin"))
      filter.sustainalyticsESGRiskMin = +searchParams.get("sustainalyticsESGRiskMin")!;
    if (searchParams.has("sustainalyticsESGRiskMax"))
      filter.sustainalyticsESGRiskMax = +searchParams.get("sustainalyticsESGRiskMax")!;

    if (searchParams.has("countries")) filter.countries = searchParams.getAll("countries") as Country[];

    if (searchParams.has("industries")) filter.industries = searchParams.getAll("industries") as Industry[];

    if (searchParams.has("size")) filter.size = searchParams.get("size") as Size;
    if (searchParams.has("style")) filter.style = searchParams.get("style") as Style;

    return filter;
  };

  // Only recompute the filter values when the search parameters change.
  return useMemo(computeFilterValues, [searchParams]);
};

export default useStockFilter;
