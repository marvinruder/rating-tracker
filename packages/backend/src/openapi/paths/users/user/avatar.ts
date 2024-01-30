import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as user from "../../../parameters/user";
import { forbidden, notFound, unauthorized, unsupportedMediaType } from "../../../responses/clientError";
import { internalServerError, notImplemented } from "../../../responses/serverError";
import { created, noContent, okAvatar } from "../../../responses/success";

/**
 * Get the avatar of a user
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Users API"],
  operationId: "getAvatar",
  summary: "Read User Avatar API endpoint",
  description: "Get the avatar of a user",
  parameters: [
    {
      ...user.email,
      in: "path",
      required: true,
    },
    {
      name: "v",
      in: "query",
      description: "A timestamp used to invalidate the client cache. Will not be processed by the server.",
      required: false,
      schema: {
        type: "integer",
      },
    },
  ],
  responses: {
    "200": okAvatar,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
    "500": internalServerError,
    "501": notImplemented,
  },
};

/**
 * Create an avatar of a user
 */
const put: OpenAPIV3.OperationObject = {
  tags: ["Users API"],
  operationId: "createAvatar",
  summary: "Create User Avatar API endpoint",
  description: "Create an avatar of a user",
  parameters: [
    {
      ...user.email,
      in: "path",
      required: true,
    },
  ],
  requestBody: {
    required: true,
    content: {
      "image/avif": {
        schema: {
          type: "string",
          format: "binary",
        },
      },
      "image/jpeg": {
        schema: {
          type: "string",
          format: "binary",
        },
      },
    },
  },
  responses: {
    "201": created,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
  },
};

/**
 * Delete the avatar of a user
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["Users API"],
  operationId: "deleteAvatar",
  summary: "Delete User Avatar API endpoint",
  description: "Delete the avatar of a user",
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
    "415": unsupportedMediaType,
  },
};

export { get, put, deleteRequest as delete };
