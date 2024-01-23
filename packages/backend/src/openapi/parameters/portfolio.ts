import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

/**
 * A unique identifier of the portfolio.
 */
export const id: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "id",
  description: "A unique identifier of the portfolio.",
  schema: {
    type: "integer",
    example: "0",
  },
};

/**
 * The name of a portfolio.
 */
export const name: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "name",
  description: "The name of the portfolio.",
  schema: {
    type: "string",
    example: "My Portfolio",
  },
};

/**
 * The currency associated with the portfolio.
 */
export const currency: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "currency",
  description: "The currency associated with the portfolio.",
  schema: {
    $ref: "#/components/schemas/Currency",
  },
};
