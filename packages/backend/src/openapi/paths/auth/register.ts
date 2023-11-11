import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as user from "../../parameters/user";
import { badRequest, forbidden, tooManyRequestsHTML } from "../../responses/clientError";
import { internalServerError } from "../../responses/serverError";
import { created, okObject } from "../../responses/success";

/**
 * Get a challenge for registering a new user via WebAuthn standard
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Authentication API"],
  operationId: "getRegistrationOptions",
  summary: "Get Registration Options API endpoint",
  description: "Get a challenge for registering a new user via WebAuthn standard",
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

/**
 * Post the response for a WebAuthn registration challenge
 */
const post: OpenAPIV3.OperationObject = {
  tags: ["Authentication API"],
  operationId: "postRegistrationResponse",
  summary: "Post Registration Response API endpoint",
  description: "Post the response for a WebAuthn registration challenge",
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
