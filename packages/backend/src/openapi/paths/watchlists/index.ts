import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as watchlist from "../../parameters/watchlist";
import { badRequest, conflict, forbidden, unauthorized } from "../../responses/clientError";
import { createdWatchlistID, okWatchlistSummary } from "../../responses/success";

/**
 * Get a list of watchlists.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Watchlists API"],
  operationId: "getWatchlists",
  summary: "Read Watchlist API endpoint",
  description: "Get a summary of all watchlists.",
  responses: {
    "200": okWatchlistSummary,
    "401": unauthorized,
  },
};

/**
 * Create the watchlist using the information provided.
 */
const put: OpenAPIV3.OperationObject = {
  tags: ["Watchlists API"],
  operationId: "putWatchlist",
  summary: "Create Watchlist API endpoint",
  description: "Create the watchlist using the information provided.",
  parameters: [
    {
      ...watchlist.name,
      required: true,
    },
  ],
  responses: {
    "201": createdWatchlistID,
    "400": badRequest,
    "401": unauthorized,
    "403": forbidden,
    "409": conflict,
  },
};

export { get, put };
