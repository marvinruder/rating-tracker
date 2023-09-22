import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as stock from "../../parameters/stock";
import { notFound, unauthorized } from "../../responses/clientError";
import { created, noContent } from "../../responses/success";

/**
 * Add a favorite.
 */
const put: OpenAPIV3.OperationObject = {
  tags: ["Favorites API"],
  operationId: "addFavorite",
  summary: "Add Favorite API",
  description: "Add a stock to the Favorites watchlist.",
  parameters: [
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "201": created,
    "401": unauthorized,
    "404": notFound,
  },
};

/**
 * Remove a favorite.
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["Favorites API"],
  operationId: "removeFavorite",
  summary: "Remove Favorite API",
  description: "Remove a stock from the Favorites watchlist.",
  parameters: [
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "204": noContent,
    "401": unauthorized,
    "404": notFound,
  },
};

export { put, deleteRequest as delete };
