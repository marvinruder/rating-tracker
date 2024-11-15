import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { oidcEndpointSuffix, registerEndpointSuffix, signInEndpointSuffix } from "@rating-tracker/commons";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import SessionService from "../session/session.service";
import { EMailSchema, NameSchema } from "../user/user.schema";
import Controller from "../utils/Controller";
import APIError from "../utils/error/api/APIError";
import BadRequestError from "../utils/error/api/BadRequestError";
import UnauthorizedError from "../utils/error/api/UnauthorizedError";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { authRateLimiter, sessionCookieOptions } from "../utils/middlewares";

import {
  AuthenticationOptionsSchema,
  AuthenticationResponseSchema,
  OIDCAuthenticationResponseSchema,
  RegistrationOptionsSchema,
  RegistrationResponseSchema,
} from "./auth.schema";
import type OIDCService from "./oidc.service";
import type WebAuthnService from "./webauthn.service";

/**
 * This controller is responsible for handling all registration and authentication requests.
 */
class AuthController extends Controller {
  constructor(
    private oidcService: OIDCService,
    private webAuthnService: WebAuthnService,
  ) {
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
          middleware: [authRateLimiter] as const,
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
          middleware: [authRateLimiter] as const,
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
          middleware: [authRateLimiter] as const,
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
          description: "Verifies the authentication response and creates a session if the challenge response is valid.",
          middleware: [authRateLimiter] as const,
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
      )
      .openapi(
        createRoute({
          method: "get",
          path: oidcEndpointSuffix,
          tags: this.tags,
          summary: "Get the OpenID Connect authorization URL",
          description: "Forwards to the OpenID Connect provider for authentication.",
          middleware: [authRateLimiter] as const,
          responses: {
            302: {
              description: "Found: The user is being redirected to the OpenID Connect provider.",
              headers: z
                .object({
                  location: z.string({ description: "The authorization URL of the OpenID Connect provider." }).url(),
                })
                .strict(),
            },
            429: {
              description: "Too Many Requests: The client has sent too many requests and is rate-limited.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            501: {
              description: "Not Implemented: No OpenID Connect provider is configured.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            503: {
              description: "Service Unavailable: Unable to fetch the OpenID Connect server metadata.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { authorizationURL, codeVerifier } = await this.oidcService.getAuthorizationURL();
          setCookie(c, "codeVerifier", codeVerifier, sessionCookieOptions);
          if (authorizationURL.searchParams.has("nonce"))
            setCookie(c, "nonce", authorizationURL.searchParams.get("nonce")!, sessionCookieOptions);
          return c.redirect(authorizationURL.toString(), 302);
        },
      )
      .openapi(
        createRoute({
          method: "post",
          path: oidcEndpointSuffix,
          tags: this.tags,
          summary: "Handle the OpenID Connect callback",
          description: "Handles the callback from the OpenID Connect provider and creates a session.",
          middleware: [authRateLimiter] as const,
          request: {
            body: {
              description: "The response from the OpenID Connect provider.",
              required: true,
              content: { "application/json": { schema: OIDCAuthenticationResponseSchema } },
            },
          },
          responses: {
            204: { description: "No Content: The user has been authenticated successfully." },
            400: {
              description: "Bad Request: The request body or cookies are invalid.",
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
            429: {
              description: "Too Many Requests: The client has sent too many requests and is rate-limited.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            501: {
              description: "Not Implemented: No OpenID Connect provider is configured.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            503: {
              description: "Service Unavailable: Unable to fetch the OpenID Connect server metadata.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const searchParams = new URLSearchParams(c.req.valid("json"));

          // Read the code verifier and nonce from the session.
          const codeVerifier = getCookie(c, "codeVerifier");
          const nonce = getCookie(c, "nonce");

          // Delete the code verifier and nonce cookies.
          deleteCookie(c, "codeVerifier", sessionCookieOptions);
          deleteCookie(c, "nonce", sessionCookieOptions);

          try {
            if (codeVerifier === undefined) throw new BadRequestError("No code verifier was provided.");
            const sessionID = await this.oidcService.handleCallback(
              c.get("user")?.email,
              searchParams,
              codeVerifier,
              nonce,
            );
            if (sessionID)
              // We create and store a session cookie for the user.
              setCookie(c, "id", sessionID, { ...sessionCookieOptions, maxAge: 1000 * SessionService.SESSION_TTL });
            return c.body(null, 204);
          } catch (e) {
            if (e instanceof APIError) throw e;
            throw new UnauthorizedError("Authentication failed", e instanceof Error ? e : undefined);
          }
        },
      );
  }
}

export default AuthController;
