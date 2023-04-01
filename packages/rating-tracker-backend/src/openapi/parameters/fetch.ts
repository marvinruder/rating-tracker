import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

/**
 * Whether to immediately respond to the request and detach the fetch process from it
 */
const detach: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "detach",
  description: "Whether to immediately respond to the request and detach the fetch process from it",
  schema: {
    type: "boolean",
    example: "false",
  },
};

/**
 * Whether not to skip fetching date due to a recent successful fetch
 */
const noSkip: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "noSkip",
  description: "Whether not to skip fetching date due to a recent successful fetch",
  schema: {
    type: "boolean",
    example: "false",
  },
};

/**
 * Whether to clear information related to the data provider before fetching
 */
const clear: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "clear",
  description: "Whether to clear information related to the data provider before fetching",
  schema: {
    type: "boolean",
    example: "false",
  },
};

export { detach, noSkip, clear };
