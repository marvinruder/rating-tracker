import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { unauthorized } from "../../responses/clientError.js";
import { okWatchlistSummary } from "../../responses/success.js";

/**
 * Get a list of watchlists.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Watchlist API"],
  operationId: "getWatchlistSummary",
  summary: "Watchlist Summary API",
  description: "Get a summary of all watchlists.",
  responses: {
    "200": okWatchlistSummary,
    "401": unauthorized,
  },
};

export { get };
