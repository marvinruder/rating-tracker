import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

/**
 * A response with a 500 Internal Server Error status code and an Error object body.
 */
export const internalServerError: OpenAPIV3.ResponseObject = {
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
 * A response with a 500 Internal Server Error status code and a Status object body.
 */
export const internalServerErrorServerUnhealthy: OpenAPIV3.ResponseObject = {
  description: "Internal Server Error – Server Unhealthy",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Status",
      },
    },
  },
};

/**
 * A response with a 501 Not Implemented status code and an Error object body.
 */
export const notImplemented: OpenAPIV3.ResponseObject = {
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
export const badGateway: OpenAPIV3.ResponseObject = {
  description: "Bad Gateway",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};
