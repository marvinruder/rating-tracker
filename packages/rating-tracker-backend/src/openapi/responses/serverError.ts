import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

/**
 * A response with a 500 Internal Server Error status code and an Error object body.
 */
const internalServerError: OpenAPIV3.ResponseObject = {
  description: "Internal Server Error",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};

/**
 * A response with a 501 Not Implemented status code and an Error object body.
 */
const notImplemented: OpenAPIV3.ResponseObject = {
  description: "Not Implemented",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};

/**
 * A response with a 502 Bad Gateway status code and an Error object body.
 */
const badGateway: OpenAPIV3.ResponseObject = {
  description: "Bad Gateway",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};

export { internalServerError, notImplemented, badGateway };
