import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { notFound, unauthorized } from "../responses/clientError";
import { noContent } from "../responses/success";

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

/**
 * Deletes the authentication token related to the session cookie.
 */
const deleteResponse: OpenAPIV3.OperationObject = {
  tags: ["Session API"],
  operationId: "session",
  summary: "Session API",
  description: "Deletes the authentication token related to the session cookie.",
  responses: {
    "204": noContent,
    "401": unauthorized,
    "404": notFound,
  },
};

export { head, deleteResponse as delete };
