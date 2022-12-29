import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

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
