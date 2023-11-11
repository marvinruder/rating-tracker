import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { unauthorized } from "../../responses/clientError";
import { okWatchlistSummary } from "../../responses/success";

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

export { get };
