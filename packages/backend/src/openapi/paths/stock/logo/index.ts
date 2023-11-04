import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as stock from "../../../parameters/stock";
import { notFound, unauthorized } from "../../../responses/clientError";
import { badGateway } from "../../../responses/serverError";
import { okSVG } from "../../../responses/success";

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
