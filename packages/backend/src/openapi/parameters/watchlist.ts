import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import * as stock from "./stock.js";

/**
 * The ticker symbol of a stock.
 */
const id: OpenAPIV3.ParameterObject = {
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
const name: OpenAPIV3.ParameterObject = {
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
const subscribed: OpenAPIV3.ParameterObject = {
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
const stocksToAdd: OpenAPIV3.ParameterObject = {
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
const stocksToRemove: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "stocksToRemove",
  description: "A list of stocks to be removed from the watchlist.",
  explode: false,
  schema: {
    type: "array",
    items: stock.ticker.schema,
  },
};

export { id, name, subscribed, stocksToAdd, stocksToRemove };
