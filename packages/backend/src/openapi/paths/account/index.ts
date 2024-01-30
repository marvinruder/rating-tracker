import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as user from "../../parameters/user";
import { unauthorized } from "../../responses/clientError";
import { noContent, okUser } from "../../responses/success";

/**
 * Get information about the current user
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Account API"],
  operationId: "getAccount",
  summary: "Read Account API endpoint",
  description: "Get information about the current user",
  responses: {
    "200": okUser,
  },
};

/**
 * Delete the current user
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["Account API"],
  operationId: "deleteAccount",
  summary: "Delete Account API endpoint",
  description: "Delete the current user",
  responses: {
    "204": noContent,
    "401": unauthorized,
  },
};

/**
 * Update the current user using the information provided
 */
const patch: OpenAPIV3.OperationObject = {
  tags: ["Account API"],
  operationId: "updateAccount",
  summary: "Update Account API endpoint",
  description: "Update the current user using the information provided.",
  parameters: [
    {
      ...user.email,
      allowEmptyValue: true,
    },
    {
      ...user.name,
      allowEmptyValue: true,
    },
    {
      ...user.phone,
      allowEmptyValue: true,
    },
    user.subscriptions,
  ],
  responses: {
    "204": noContent,
    "401": unauthorized,
  },
};

export { get, deleteRequest as delete, patch };
