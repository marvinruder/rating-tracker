import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as portfolio from "../../../parameters/portfolio";
import * as stock from "../../../parameters/stock";
import { conflict, forbidden, notFound, unauthorized } from "../../../responses/clientError";
import { created, noContent } from "../../../responses/success";

/**
 * Add a stock to a portfolio.
 */
const put: OpenAPIV3.OperationObject = {
  tags: ["Portfolios API"],
  operationId: "putStockToPortfolio",
  summary: "Add Stock to Portfolio API endpoint",
  description: "Add a stock to a portfolio.",
  parameters: [
    {
      ...portfolio.id,
      in: "path",
      required: true,
    },
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
    {
      ...stock.amount,
      required: true,
    },
  ],
  responses: {
    "201": created,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
    "409": conflict,
  },
};

/**
 * Update a stock in a portfolio.
 */
const patch: OpenAPIV3.OperationObject = {
  tags: ["Portfolios API"],
  operationId: "patchStockInPortfolio",
  summary: "Update Stock in Portfolio API endpoint",
  description: "Update a stock in a portfolio.",
  parameters: [
    {
      ...portfolio.id,
      in: "path",
      required: true,
    },
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
    stock.amount,
  ],
  responses: {
    "204": noContent,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
    "409": conflict,
  },
};

/**
 * Remove a stock from a portfolio.
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["Portfolios API"],
  operationId: "deleteStockFromPortfolio",
  summary: "Remove Stock from Portfolio API endpoint",
  description: "Remove a stock from a portfolio.",
  parameters: [
    {
      ...portfolio.id,
      in: "path",
      required: true,
    },
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "204": noContent,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
    "409": conflict,
  },
};

export { put, patch, deleteRequest as delete };
