import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { okWatchlist } from "../../responses/success";
import { unauthorized } from "../../responses/clientError";

/**
 * Get all favorites.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Favorites API"],
  operationId: "getFavorites",
  summary: "Get Favorites API",
  description: "Get the Favorites watchlist.",
  responses: {
    "200": okWatchlist,
    "401": unauthorized,
  },
};

export { get };
