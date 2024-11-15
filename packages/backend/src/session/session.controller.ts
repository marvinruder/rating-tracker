import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { GENERAL_ACCESS } from "@rating-tracker/commons";
import { deleteCookie, getCookie } from "hono/cookie";

import type OIDCService from "../auth/oidc.service";
import Controller from "../utils/Controller";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator, sessionCookieOptions } from "../utils/middlewares";

import type SessionService from "./session.service";

/**
 * This controller is responsible for handling session information.
 */
class SessionController extends Controller {
  constructor(
    private oidcService: OIDCService,
    private sessionService: SessionService,
  ) {
    super({ tags: ["Session API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler })
      .openapi(
        createRoute({
          method: "get",
          path: "",
          tags: this.tags,
          summary: "Get the current authentication status",
          description:
            "Provides information regarding the authentication status. " +
            "Returns a 2XX response code if the authentication token cookie is still valid, " +
            "and a 4XX response code otherwise.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          responses: {
            204: { description: "No Content: The user is authenticated." },
            401: { description: "Unauthorized: The user is not authenticated." },
          },
        }),
        (c) => c.body(null, 204),
      )
      .openapi(
        createRoute({
          method: "delete",
          path: "",
          tags: this.tags,
          summary: "Delete the current session",
          description: "Deletes the current session from the database and clears the session cookie.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          responses: {
            200: {
              description:
                "OK: The front-channel logout URI to be accessed by the user in order to log out from OpenID Connect.",
              content: {
                "application/json": {
                  schema: z
                    .object({
                      frontchannelLogoutURI: z
                        .string({
                          description:
                            "The front-channel logout URI to be accessed by the user " +
                            "in order to log out from OpenID Connect",
                        })
                        .url(),
                    })
                    .strict(),
                },
              },
            },
            204: { description: "No Content: The user is no longer authenticated." },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const oidcIDToken = await this.sessionService.delete(getCookie(c, "id")!);
          deleteCookie(c, "id", sessionCookieOptions);
          if (oidcIDToken) {
            const frontchannelLogoutURI = await this.oidcService.getFrontchannelLogoutURI(oidcIDToken);
            if (frontchannelLogoutURI instanceof URL)
              return c.json({ frontchannelLogoutURI: frontchannelLogoutURI.href }, 200);
          }
          return c.body(null, 204);
        },
      );
  }
}

export default SessionController;
