import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { registerEndpointSuffix, signInEndpointSuffix } from "@rating-tracker/commons";
import { setCookie } from "hono/cookie";

import SessionService from "../session/session.service";
import { EMailSchema, NameSchema } from "../user/user.schema";
import Controller from "../utils/Controller";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { authRateLimiter, sessionCookieOptions } from "../utils/middlewares";

import {
  AuthenticationOptionsSchema,
  AuthenticationResponseSchema,
  RegistrationOptionsSchema,
  RegistrationResponseSchema,
} from "./auth.schema";
import type WebAuthnService from "./webauthn.service";

/**
 * This controller is responsible for handling all registration and authentication requests.
 */
class AuthController extends Controller {
  constructor(private webAuthnService: WebAuthnService) {
    super({ tags: ["Authentication API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler })
      .openapi(
        createRoute({
          method: "get",
          path: registerEndpointSuffix,
          tags: this.tags,
          summary: "Get a challenge for registering a new user",
          description: "Generates a registration challenge for the user to register via the WebAuthn standard",
          middleware: [authRateLimiter],
          request: { query: z.object({ email: EMailSchema, name: NameSchema }).strict() },
          responses: {
            200: {
              description: "OK: The registration challenge.",
              content: { "application/json": { schema: RegistrationOptionsSchema } },
            },
            400: {
              description: "Bad Request: The request query is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            409: {
              description: "Conflict: A user with this email is already registered.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            429: {
              description: "Too Many Requests: The client has sent too many requests and is rate-limited.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { email, name } = c.req.valid("query");
          return c.json(await this.webAuthnService.generateRegistrationOptions(name, email), 200);
        },
      )
      .openapi(
        createRoute({
          method: "post",
          path: registerEndpointSuffix,
          tags: this.tags,
          summary: "Verify the response for a WebAuthn registration challenge",
          description: "Verifies the registration response and creates a new user if the request is valid.",
          middleware: [authRateLimiter],
          request: {
            query: z.object({ email: EMailSchema, name: NameSchema }).strict(),
            body: {
              description: "The response to the registration challenge.",
              required: true,
              content: { "application/json": { schema: RegistrationResponseSchema } },
            },
          },
          responses: {
            201: { description: "Created: The user has been registered successfully." },
            400: {
              description: "Bad Request: The request query or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The registration response is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            409: {
              description: "Conflict: A user with this email is already registered.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            422: {
              description: "Unprocessable Entity: The registration response is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            429: {
              description: "Too Many Requests: The client has sent too many requests and is rate-limited.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { email, name } = c.req.valid("query");
          await this.webAuthnService.verifyRegistrationResponse(name, email, c.req.valid("json"));
          return c.body(null, 201);
        },
      )
      .openapi(
        createRoute({
          method: "get",
          path: signInEndpointSuffix,
          tags: this.tags,
          summary: "Get a challenge for authenticating as a registered user",
          description:
            "Generates an authentication challenge for any user to sign in. " +
            "The challenge is not related to a specific user.",
          middleware: [authRateLimiter],
          responses: {
            200: {
              description: "OK: The authentication challenge.",
              content: { "application/json": { schema: AuthenticationOptionsSchema } },
            },
            429: {
              description: "Too Many Requests: The client has sent too many requests and is rate-limited.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => c.json(await this.webAuthnService.generateAuthenticationOptions(), 200),
      )
      .openapi(
        createRoute({
          method: "post",
          path: signInEndpointSuffix,
          tags: this.tags,
          summary: "Verify the response for a WebAuthn authentication challenge",
          description:
            "Verifies the authentication response and creates a session cookie if the challenge response is valid.",
          middleware: [authRateLimiter],
          request: {
            body: {
              description: "The response to the authentication challenge.",
              required: true,
              content: { "application/json": { schema: AuthenticationResponseSchema } },
            },
          },
          responses: {
            204: { description: "No Content: The user has been authenticated successfully." },
            400: {
              description: "Bad Request: The request body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The authentication failed.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The authentication succeeded, but the user is not allowed to sign in.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description: "Not Found: The credential used for authentication does not exist.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            422: {
              description: "Unprocessable Entity: The authentication response is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            429: {
              description: "Too Many Requests: The client has sent too many requests and is rate-limited.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const sessionID = await this.webAuthnService.verifyAuthenticationResponse(c.req.valid("json"));
          // We create and store a session cookie for the user.
          setCookie(c, "id", sessionID, { ...sessionCookieOptions, maxAge: 1000 * SessionService.SESSION_TTL });
          return c.body(null, 204);
        },
      );
  }
}

export default AuthController;
