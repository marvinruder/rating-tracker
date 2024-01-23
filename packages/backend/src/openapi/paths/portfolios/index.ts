import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { unauthorized } from "../../responses/clientError";
import { okPortfolioSummary } from "../../responses/success";

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

export { get };
