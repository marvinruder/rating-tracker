import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as portfolio from "../../../parameters/portfolio";
import { badRequest, forbidden, notFound, unauthorized } from "../../../responses/clientError";
import { noContent, okPortfolio } from "../../../responses/success";

/**
 * Get the specified portfolio
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Portfolios API"],
  operationId: "getPortfolio",
  summary: "Read Portfolio API endpoint",
  description: "Get the specified portfolio",
  parameters: [
    {
      ...portfolio.id,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "200": okPortfolio,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

/**
 * Update the portfolio using the information provided.
 */
const patch: OpenAPIV3.OperationObject = {
  tags: ["Portfolios API"],
  operationId: "patchPortfolio",
  summary: "Update Portfolio API endpoint",
  description: "Update the portfolio using the information provided.",
  parameters: [
    {
      ...portfolio.id,
      in: "path",
      required: true,
    },
    portfolio.name,
    portfolio.currency,
  ],
  responses: {
    "204": noContent,
    "400": badRequest,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

/**
 * Delete the specified portfolio
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["Portfolios API"],
  operationId: "deletePortfolio",
  summary: "Delete Portfolio API endpoint",
  description: "Delete the specified portfolio",
  parameters: [
    {
      ...portfolio.id,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "204": noContent,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

export { get, deleteRequest as delete, patch };
