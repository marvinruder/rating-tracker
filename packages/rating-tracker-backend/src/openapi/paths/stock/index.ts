import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "../../responses/clientError.js";
import { created, noContent, okStock } from "../../responses/success.js";
import * as stock from "../../parameters/stock.js";

/**
 * Get the specified stock
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "getStock",
  summary: "Get Stock API",
  description: "Get the specified stock",
  parameters: [
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "200": okStock,
    "401": unauthorized,
    "404": notFound,
  },
};

/**
 * Delete the specified stock
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "deleteStock",
  summary: "Delete Stock API",
  description: "Delete the specified stock",
  parameters: [
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
  },
};

/**
 * Create the stock using the information provided.
 */
const put: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "createStock",
  summary: "Create Stock API",
  description: "Create the stock using the information provided.",
  parameters: [
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
    {
      ...stock.name,
      required: true,
    },
    {
      ...stock.isin,
      required: true,
    },
    {
      ...stock.country,
      required: true,
      schema: {
        $ref: "#/components/schemas/Country",
      },
    },
  ],
  responses: {
    "201": created,
    "401": unauthorized,
    "403": forbidden,
    "409": conflict,
  },
};

/**
 * Update the stock using the information provided.
 */
const patch: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "updateStock",
  summary: "Update Stock API",
  description: "Update the stock using the information provided.",
  parameters: [
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
    stock.name,
    stock.isin,
    {
      ...stock.country,
      schema: {
        $ref: "#/components/schemas/Country",
      },
    },
    {
      ...stock.morningstarID,
      allowEmptyValue: true,
    },
    {
      ...stock.marketScreenerID,
      allowEmptyValue: true,
    },
    {
      ...stock.msciID,
      allowEmptyValue: true,
    },
    {
      ...stock.ric,
      allowEmptyValue: true,
    },
    {
      ...stock.spID,
      allowEmptyValue: true,
    },
    {
      ...stock.sustainalyticsID,
      allowEmptyValue: true,
    },
  ],
  responses: {
    "204": noContent,
    "400": badRequest,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

export { get, deleteRequest as delete, put, patch };
