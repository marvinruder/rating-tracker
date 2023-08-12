import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { unauthorized } from "../../responses/clientError";
import { noContent } from "../../responses/success";

/**
 * (Re-)Compute dynamic attributes of all stocks.
 */
const post: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "computeStock",
  summary: "Stock Compute API",
  description: "(Re-)Compute dynamic attributes of all stocks.",
  responses: {
    "204": noContent,
    "401": unauthorized,
  },
};

export { post };
