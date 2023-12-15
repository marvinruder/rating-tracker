import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

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
    example: "My Watchlist",
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
