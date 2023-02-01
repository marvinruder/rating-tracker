import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

/**
 * The email address of a user, used as their ID
 */
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

/**
 * The common name of a user
 */
const name: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "name",
  description: "The common name of a user",
  schema: {
    type: "string",
    example: "Jane Doe",
  },
};

/**
 * The phone number of a user, used for Signal messages
 */
const phone: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "phone",
  description: "The phone number of a user, used for Signal messages",
  schema: {
    type: "string",
    example: "+491234567890",
  },
};

export { email, name, phone };
