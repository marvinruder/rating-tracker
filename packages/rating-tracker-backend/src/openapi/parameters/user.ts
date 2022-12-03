import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

const email: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "email",
  description: "The email address of a user, used as their ID",
  schema: {
    type: "string",
    format: "email",
    example: "jane.doe@example.com",
  },
};

const name: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "name",
  description: "The common name of a user",
  schema: {
    type: "string",
    example: "Jane Doe",
  },
};

export { email, name };
