import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { unauthorized } from "../../responses/clientError.js";
import { noContent, okUser } from "../../responses/success.js";
import * as user from "../../parameters/user.js";

/**
 * Get information about the current user
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["User API"],
  operationId: "getUser",
  summary: "Read User API",
  description: "Get information about the current user",
  responses: {
    "200": okUser,
    "401": unauthorized,
  },
};

/**
 * Delete the current user
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["User API"],
  operationId: "deleteUser",
  summary: "Delete User API",
  description: "Delete the current user",
  responses: {
    "204": noContent,
    "401": unauthorized,
  },
};

/**
 * Update the current user using the information provided.
 */
const patch: OpenAPIV3.OperationObject = {
  tags: ["User API"],
  operationId: "updateUser",
  summary: "Update User API",
  description: "Update the current user using the information provided.",
  parameters: [
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
  requestBody: {
    required: false,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            avatar: {
              type: "string",
              format: "binary",
            },
          },
        },
      },
    },
  },
  responses: {
    "204": noContent,
    "401": unauthorized,
  },
};

export { get, deleteRequest as delete, patch };
