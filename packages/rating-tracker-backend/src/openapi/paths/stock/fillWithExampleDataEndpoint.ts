import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { unauthorized } from "../../responses/clientError.js";
import { created } from "../../responses/success.js";

const put: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "putExampleStocks",
  summary: "Stock Example Data API",
  description: "Fills the connected data service with example stocks",
  responses: {
    "201": created,
    "401": unauthorized,
  },
};

export { put };
