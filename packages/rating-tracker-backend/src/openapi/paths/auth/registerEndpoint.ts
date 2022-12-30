import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import * as user from "../../parameters/user.js";
import {
  badRequest,
  forbidden,
  tooManyRequestsHTML,
} from "../../responses/clientError.js";
import { internalServerError } from "../../responses/serverError.js";
import { created, okObject } from "../../responses/success.js";

const get: OpenAPIV3.OperationObject = {
  tags: ["Authentication API"],
  operationId: "getRegistrationOptions",
  summary: "Get Registration Options API",
  description:
    "Get information required for registering a new user via WebAuthn standard",
  parameters: [
    { ...user.email, required: true },
    { ...user.name, required: true },
  ],
  responses: {
    "200": okObject,
    "403": forbidden,
    "429": tooManyRequestsHTML,
  },
};

const post: OpenAPIV3.OperationObject = {
  tags: ["Authentication API"],
  operationId: "postRegistrationResponse",
  summary: "Post Registration Response API",
  description: "Post the response for the WebAuthn registration challenge",
  parameters: [
    { ...user.email, required: true },
    { ...user.name, required: true },
  ],
  responses: {
    "201": created,
    "400": badRequest,
    "403": forbidden,
    "429": tooManyRequestsHTML,
    "500": internalServerError,
  },
};

export { get, post };
