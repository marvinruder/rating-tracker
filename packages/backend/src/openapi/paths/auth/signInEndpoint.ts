import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { badRequest, forbidden, notFound, tooManyRequestsHTML } from "../../responses/clientError";
import { internalServerError } from "../../responses/serverError";
import { noContent, okObject } from "../../responses/success";

/**
 * Get a challenge for authenticating as a registered user via WebAuthn standard
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Authentication API"],
  operationId: "getAuthenticationOptions",
  summary: "Get Authentication Options API",
  description: "Get a challenge for authenticating as a registered user via WebAuthn standard",
  responses: {
    "200": okObject,
    "429": tooManyRequestsHTML,
  },
};

/**
 * Post the response for a WebAuthn authentication challenge
 */
const post: OpenAPIV3.OperationObject = {
  tags: ["Authentication API"],
  operationId: "postAuthenticationResponse",
  summary: "Post Authentication Response API",
  description: "Post the response for a WebAuthn authentication challenge",
  responses: {
    "204": noContent,
    "400": badRequest,
    "403": forbidden,
    "404": notFound,
    "429": tooManyRequestsHTML,
    "500": internalServerError,
  },
};

export { get, post };
