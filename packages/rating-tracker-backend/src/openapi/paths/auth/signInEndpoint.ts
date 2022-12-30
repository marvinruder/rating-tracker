import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import {
  badRequest,
  forbidden,
  tooManyRequestsHTML,
} from "../../responses/clientError.js";
import { internalServerError } from "../../responses/serverError.js";
import { noContent, okObject } from "../../responses/success.js";

const get: OpenAPIV3.OperationObject = {
  tags: ["Authentication API"],
  operationId: "getAuthenticationOptions",
  summary: "Get Authentication Options API",
  description:
    "Get information required for authenticating as a registered user via WebAuthn standard",
  responses: {
    "200": okObject,
    "429": tooManyRequestsHTML,
  },
};

const post: OpenAPIV3.OperationObject = {
  tags: ["Authentication API"],
  operationId: "postAuthenticationResponse",
  summary: "Post Authentication Response API",
  description: "Post the response for the WebAuthn authentication challenge",
  responses: {
    "204": noContent,
    "400": badRequest,
    "403": forbidden,
    "429": tooManyRequestsHTML,
    "500": internalServerError,
  },
};

export { get, post };
