import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import {
  conflict,
  notFound,
  unauthorized,
} from "../../responses/clientError.js";
import { created, noContent, okStock } from "../../responses/success.js";
import * as stock from "../../parameters/stock.js";

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
    "404": notFound,
  },
};

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
      ...stock.country,
      required: true,
      allowReserved: false,
      schema: {
        $ref: "#/components/schemas/Country",
      },
    },
  ],
  responses: {
    "201": created,
    "401": unauthorized,
    "409": conflict,
  },
};

const patch: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "updateStock",
  summary: "Update Stock API",
  description: "Upd atethe stock using the information provided.",
  parameters: [
    {
      ...stock.ticker,
      in: "path",
      required: true,
    },
    stock.name,
    {
      ...stock.country,
      allowReserved: false,
      schema: {
        $ref: "#/components/schemas/Country",
      },
    },
    {
      ...stock.morningstarId,
      allowEmptyValue: true,
    },
    {
      ...stock.msciId,
      allowEmptyValue: true,
    },
  ],
  responses: {
    "204": noContent,
    "401": unauthorized,
    "404": notFound,
  },
};

export { get, deleteRequest as delete, put, patch };
