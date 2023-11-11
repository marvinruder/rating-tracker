import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as stock from "../../parameters/stock";
import * as watchlist from "../../parameters/watchlist";
import { forbidden, unauthorized } from "../../responses/clientError";
import { noContent, okStockListWithCount } from "../../responses/success";

/**
 * Get a list of stocks. Supports pagination.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Stocks API"],
  operationId: "getStocks",
  summary: "Read Stocks API endpoint",
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

/**
 * (Re-)Compute dynamic attributes of all stocks.
 */
const patch: OpenAPIV3.OperationObject = {
  tags: ["Stocks API"],
  operationId: "patchStocks",
  summary: "Update Stocks API endpoint",
  description: "(Re-)Compute dynamic attributes of all stocks.",
  responses: {
    "204": noContent,
    "401": unauthorized,
  },
};

export { get, patch };
