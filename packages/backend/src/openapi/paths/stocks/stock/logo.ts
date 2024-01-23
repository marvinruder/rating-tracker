import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as stock from "../../../parameters/stock";
import { notFound, unauthorized } from "../../../responses/clientError";
import { badGateway } from "../../../responses/serverError";
import { okSVG } from "../../../responses/success";

/**
 * Get the logo for the specified stock
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Stocks API"],
  operationId: "getStockLogo",
  summary: "Read Stock Logo API endpoint",
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
      description: "Whether to return a logo for a dark background",
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
