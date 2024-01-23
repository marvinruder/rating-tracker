import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as stock from "../../../parameters/stock";
import * as watchlist from "../../../parameters/watchlist";
import { forbidden, notFound, unauthorized } from "../../../responses/clientError";
import { created, noContent } from "../../../responses/success";

/**
 * Add a stock to a watchlist.
 */
const put: OpenAPIV3.OperationObject = {
  tags: ["Watchlists API"],
  operationId: "putStockToWatchlist",
  summary: "Add Stock to Watchlist API endpoint",
  description: "Add a stock to a watchlist.",
  parameters: [
    {
      ...watchlist.id,
      in: "path",
      required: true,
    },
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "201": created,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

/**
 * Remove a stock from a watchlist.
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["Watchlists API"],
  operationId: "deleteStockFromWatchlist",
  summary: "Remove Stock from Watchlist API endpoint",
  description: "Remove a stock from a watchlist.",
  parameters: [
    {
      ...watchlist.id,
      in: "path",
      required: true,
    },
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "204": noContent,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

export { put, deleteRequest as delete };
