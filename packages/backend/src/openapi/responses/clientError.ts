import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

/**
 * A response with a 400 Bad Request status code and an Error object body.
 */
const badRequest: OpenAPIV3.ResponseObject = {
  description: "Bad Request",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};

/**
 * A response with a 401 Unauthorized status code and an Error object body.
 */
const unauthorized: OpenAPIV3.ResponseObject = {
  description: "Unauthorized",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};

/**
 * A response with a 403 Forbidden status code and an Error object body.
 */
const forbidden: OpenAPIV3.ResponseObject = {
  description: "Forbidden",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};

/**
 * A response with a 404 Not Found status code and an Error object body.
 */
const notFound: OpenAPIV3.ResponseObject = {
  description: "Not found",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};

/**
 * A response with a 409 Conflict status code and an Error object body.
 */
const conflict: OpenAPIV3.ResponseObject = {
  description: "Conflict",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};

/**
 * A response with a 429 Too Many Requests status code and an HTML body. Used by Express.js rate limiting middleware.
 */
const tooManyRequestsHTML: OpenAPIV3.ResponseObject = {
  description: "Too Many Requests",
  content: {
    "text/html": {},
  },
};

/**
 * A response with a 429 Too Many Requests status code and an Error object body. Used to forward rate limiting errors
 * from APIs such as Refinitiv.
 */
const tooManyRequestsJSONError: OpenAPIV3.ResponseObject = {
  description: "Too Many Requests",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};

export { badRequest, unauthorized, forbidden, notFound, conflict, tooManyRequestsHTML, tooManyRequestsJSONError };
