import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import {
  conflict,
  notFound,
  unauthorized,
} from "../../responses/clientError.js";
import { created, noContent } from "../../responses/success.js";
import * as stock from "../../parameters/stock.js";

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

export { deleteRequest as delete, put };
