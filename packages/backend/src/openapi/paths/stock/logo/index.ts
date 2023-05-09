import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import * as stock from "../../../parameters/stock.js";
import { notFound, unauthorized } from "../../../responses/clientError.js";
import { badGateway } from "../../../responses/serverError.js";
import { okSVG } from "../../../responses/success.js";

/**
 * Get the logo for the specified stock
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "getStockLogo",
  summary: "Get Stock Logo API",
  description: "Get the logo for the specified stock",
  parameters: [
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
    {
      in: "query",
      name: "dark",
      description: "Whether to return a dark logo",
      schema: {
        type: "boolean",
        example: true,
      },
    },
  ],
  responses: {
    "200": okSVG,
    "401": unauthorized,
    "404": notFound,
    "502": badGateway,
  },
};

export { get };
