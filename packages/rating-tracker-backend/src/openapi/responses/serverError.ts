import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

const badGateway: OpenAPIV3.ResponseObject = {
  description: "Unable to fetch",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error",
      },
    },
  },
};

export { badGateway };
