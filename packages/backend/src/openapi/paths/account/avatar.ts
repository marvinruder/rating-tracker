import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { notFound, unauthorized, unsupportedMediaType } from "../../responses/clientError";
import { internalServerError, notImplemented } from "../../responses/serverError";
import { created, noContent, okAvatar } from "../../responses/success";

/**
 * Get the avatar of the current user
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Account API"],
  operationId: "getAvatar",
  summary: "Read Account Avatar API endpoint",
  description: "Get the avatar of the current user",
  parameters: [
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
    "404": notFound,
    "500": internalServerError,
    "501": notImplemented,
  },
};

/**
 * Create an avatar of the current user
 */
const put: OpenAPIV3.OperationObject = {
  tags: ["Account API"],
  operationId: "createAvatar",
  summary: "Create Account Avatar API endpoint",
  description: "Create an avatar of the current user",
  requestBody: {
    required: true,
    content: {
      "image/avif": {
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
    "415": unsupportedMediaType,
  },
};

/**
 * Delete the avatar of the current user
 */
const deleteRequest: OpenAPIV3.OperationObject = {
  tags: ["Account API"],
  operationId: "deleteAvatar",
  summary: "Delete Account Avatar API endpoint",
  description: "Delete the avatar of the current user",
  responses: {
    "204": noContent,
    "401": unauthorized,
  },
};

export { get, put, deleteRequest as delete };
