import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as stock from "./stock";

/**
 * A unique identifier of the watchlist.
 */
export const id: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "id",
  description: "A unique identifier of the watchlist.",
  schema: {
    type: "integer",
    example: "0",
  },
};

/**
 * The name of a watchlist.
 */
export const name: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "name",
  description: "The name of the watchlist.",
  schema: {
    type: "string",
    example: "Favorites",
  },
};

/**
 * Whether the user subscribed to updates for the watchlist’s stocks.
 */
export const subscribed: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "subscribed",
  description: "Whether the user subscribed to updates for the watchlist’s stocks.",
  schema: {
    type: "boolean",
    example: true,
  },
};

/**
 * A list of stocks to be added to the watchlist.
 */
export const stocksToAdd: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "stocksToAdd",
  description: "A list of stocks to be added to the watchlist.",
  explode: false,
  schema: {
    type: "array",
    items: stock.ticker.schema,
  },
};

/**
 * A list of stocks to be removed from the watchlist.
 */
export const stocksToRemove: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "stocksToRemove",
  description: "A list of stocks to be removed from the watchlist.",
  explode: false,
  schema: {
    type: "array",
    items: stock.ticker.schema,
  },
};
