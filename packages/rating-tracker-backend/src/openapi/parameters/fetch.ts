import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

const detach: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "detach",
  description:
    "Whether to immediately respond to the request and detach the fetch process from it",
  schema: {
    type: "boolean",
    example: "false",
  },
};

const skip: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "noSkip",
  description:
    "Whether not to skip fetching date due to a recent successful fetch",
  schema: {
    type: "boolean",
    example: "false",
  },
};

export { detach, skip };
