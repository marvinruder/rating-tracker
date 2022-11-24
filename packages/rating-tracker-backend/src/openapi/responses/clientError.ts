import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

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

const tooManyRequests: OpenAPIV3.ResponseObject = {
  description: "Too Many Requests",
  content: {
    "text/html": {},
  },
};

export { badRequest, unauthorized, forbidden, notFound, tooManyRequests };
