import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as portfolio from "../../parameters/portfolio";
import { badRequest, conflict, unauthorized } from "../../responses/clientError";
import { createdPortfolioID, okPortfolioSummary } from "../../responses/success";

/**
 * Get a list of portfolios.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Portfolios API"],
  operationId: "getPortfolios",
  summary: "Read Portfolio API endpoint",
  description: "Get a summary of all portfolios.",
  responses: {
    "200": okPortfolioSummary,
    "401": unauthorized,
  },
};

/**
 * Create the portfolio using the information provided.
 */
const put: OpenAPIV3.OperationObject = {
  tags: ["Portfolios API"],
  operationId: "putPortfolio",
  summary: "Create Portfolio API endpoint",
  description: "Create the portfolio using the information provided.",
  parameters: [
    {
      ...portfolio.name,
      required: true,
    },
    {
      ...portfolio.currency,
      required: true,
    },
  ],
  responses: {
    "201": createdPortfolioID,
    "400": badRequest,
    "401": unauthorized,
    "409": conflict,
  },
};

export { get, put };
