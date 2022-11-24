import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { notFound, unauthorized } from "../../responses/clientError.js";
import { noContent } from "../../responses/success.js";
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

export { deleteRequest as delete };
