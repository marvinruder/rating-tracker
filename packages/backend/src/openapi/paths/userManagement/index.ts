import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { forbidden, notFound, unauthorized } from "../../responses/clientError";
import { noContent, okUser } from "../../responses/success";
import * as user from "../../parameters/user";

/**
 * Get information about a user
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["User Management API"],
  operationId: "getUser",
  summary: "Get User API",
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
  tags: ["User Management API"],
  operationId: "deleteUser",
  summary: "Delete User API",
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
  tags: ["User Management API"],
  operationId: "updateUser",
  summary: "Update User API",
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
