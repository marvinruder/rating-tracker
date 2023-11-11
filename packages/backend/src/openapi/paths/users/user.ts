import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as user from "../../parameters/user";
import { forbidden, notFound, unauthorized } from "../../responses/clientError";
import { noContent, okUser } from "../../responses/success";

/**
 * Get information about a user
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Users API"],
  operationId: "getUser",
  summary: "Read User API endpoint",
  description: "Get information about a user",
  parameters: [
    {
      ...user.email,
      in: "path",
      required: true,
    },
  ],
  responses: {
    "200": okUser,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

/**
 * Delete a user
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["Users API"],
  operationId: "deleteUser",
  summary: "Delete User API endpoint",
  description: "Delete a user",
  parameters: [
    {
      ...user.email,
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
 * Update a user using the information provided.
 */
const patch: OpenAPIV3.OperationObject = {
  tags: ["Users API"],
  operationId: "patchUser",
  summary: "Update User API endpoint",
  description: "Update a user using the information provided.",
  parameters: [
    {
      ...user.email,
      in: "path",
      required: true,
    },
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
    user.accessRights,
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
    "403": forbidden,
    "404": notFound,
  },
};

export { get, deleteRequest as delete, patch };
