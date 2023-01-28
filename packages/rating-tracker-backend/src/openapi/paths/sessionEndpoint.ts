import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { unauthorized } from "../responses/clientError.js";
import { noContent } from "../responses/success.js";

/**
 * Returns a 2XX response code if the authentication token cookie is still valid, and a 4XX response code otherwise.
 */
const head: OpenAPIV3.OperationObject = {
  tags: ["Session API"],
  operationId: "session",
  summary: "Session API",
  description:
    "Returns a 2XX response code if the authentication token cookie is still valid, and a 4XX response code otherwise.",
  responses: {
    "204": noContent,
    "401": unauthorized,
  },
};

export { head };
