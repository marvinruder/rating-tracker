import { REGEX_PHONE_NUMBER } from "@rating-tracker/commons";
import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

/**
 * The email address of a user, used as their ID
 */
export const email: OpenAPIV3.ParameterObject = {
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
export const name: OpenAPIV3.ParameterObject = {
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
export const phone: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "phone",
  description: "The phone number of a user, used for Signal messages",
  schema: {
    type: "string",
    pattern: REGEX_PHONE_NUMBER,
    example: "+491234567890",
  },
};

/**
 * The access rights of the user, encoded as a bitfield
 */
export const accessRights: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "accessRights",
  description: "The access rights of the user, encoded as a bitfield",
  schema: {
    type: "integer",
    example: 1,
  },
};

/**
 * The subscriptions of the user to different types of messages, encoded as a bitfield
 */
export const subscriptions: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "subscriptions",
  description: "The subscriptions of the user to different types of messages, encoded as a bitfield",
  schema: {
    type: "integer",
    example: 1,
  },
};
