import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import * as stock from "../../parameters/stock.js";
import * as watchlist from "../../parameters/watchlist.js";
import { forbidden, unauthorized } from "../../responses/clientError.js";
import { okStockListWithCount } from "../../responses/success.js";

/**
 * Get a list of stocks. Supports pagination.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "getStockList",
  summary: "Stock List API",
  description: "Get a list of stocks. Supports pagination.",
  parameters: [
    stock.offset,
    stock.count,
    stock.sortBy,
    stock.sortDesc,
    stock.name,
    stock.country,
    stock.industry,
    stock.size,
    stock.style,
    stock.starRatingMin,
    stock.starRatingMax,
    stock.dividendYieldPercentMin,
    stock.dividendYieldPercentMax,
    stock.priceEarningRatioMin,
    stock.priceEarningRatioMax,
    stock.morningstarFairValueDiffMin,
    stock.morningstarFairValueDiffMax,
    stock.analystConsensusMin,
    stock.analystConsensusMax,
    stock.analystCountMin,
    stock.analystCountMax,
    stock.analystTargetDiffMin,
    stock.analystTargetDiffMax,
    stock.msciESGRatingMin,
    stock.msciESGRatingMax,
    stock.msciTemperatureMin,
    stock.msciTemperatureMax,
    stock.refinitivESGScoreMin,
    stock.refinitivESGScoreMax,
    stock.refinitivEmissionsMin,
    stock.refinitivEmissionsMax,
    stock.spESGScoreMin,
    stock.spESGScoreMax,
    stock.sustainalyticsESGRiskMin,
    stock.sustainalyticsESGRiskMax,
    stock.financialScoreMin,
    stock.financialScoreMax,
    stock.esgScoreMin,
    stock.esgScoreMax,
    stock.totalScoreMin,
    stock.totalScoreMax,
    {
      ...watchlist.id,
      name: "watchlist",
    },
  ],
  responses: {
    "200": okStockListWithCount,
    "401": unauthorized,
    "403": forbidden,
  },
};

export { get };
