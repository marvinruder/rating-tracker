import path from "node:path";

import { getConnInfo } from "@hono/node-server/conninfo";
import { serveStatic } from "@hono/node-server/serve-static";
import { basePath, FORBIDDEN_ERROR_MESSAGE, UNAUTHORIZED_ERROR_MESSAGE } from "@rating-tracker/commons";
import type { MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { rateLimiter } from "hono-rate-limiter";

import SessionService from "../session/session.service";

import ForbiddenError from "./error/api/ForbiddenError";
import InternalServerError from "./error/api/InternalServerError";
import TooManyRequestsError from "./error/api/TooManyRequestsError";
import UnauthorizedError from "./error/api/UnauthorizedError";

export const sessionCookieOptions = { path: basePath, httpOnly: true, secure: true, sameSite: "strict" } as const;

/**
 * Validates that the current user has the required access rights to access the protected endpoint.
 * @param accessRights The required access rights, encoded as a bitfield.
 * @returns The middleware handler.
 */
export const accessRightValidator: (accessRights: number) => MiddlewareHandler = (accessRights) => async (c, next) => {
  // Check if the user is authenticated and has the required access rights for the endpoint
  if (c.get("user")?.hasAccessRight(accessRights)) await next();
  else
    throw c.get("user")
      ? // Use the correct error type and message based on whether a user is authenticated.
        new ForbiddenError(FORBIDDEN_ERROR_MESSAGE)
      : new UnauthorizedError(UNAUTHORIZED_ERROR_MESSAGE);
};

/**
 * Rate limiter in use by authentication routes.
 */
export const authRateLimiter = rateLimiter({
  keyGenerator: (c) => c.get("ip"),
  windowMs: 1000 * 60,
  limit: 60,
  handler: () => {
    throw new TooManyRequestsError("Please try again later.");
  },
});

/**
 * Extracts the IP address from the request and sets it as a context variable.
 * @param c The Hono context.
 * @param next The next middleware handler.
 */
export const ipExtractor: MiddlewareHandler = async (c, next) => {
  const lastTrustworthyIP = c.req
    .header("X-Forwarded-For")
    ?.split(",") // Read the IP addresses from the X-Forwarded-For header, if present.
    .reverse() // The first IPs are the closest proxies, and the last ones were potentially set by a malicious client,
    .slice(0, process.env.TRUSTWORTHY_PROXY_COUNT) // so we cut them off
    .at(-1); // and look at the last trustworthy IP.
  const ip = lastTrustworthyIP ?? getConnInfo(c).remote.address;
  if (!ip) throw new InternalServerError("No IP address found.");
  c.set("ip", ip);
  await next();
};

/**
 * Checks for user authentication via session cookie.
 * @param sessionService The session service.
 * @returns The middleware handler.
 */
export const sessionValidator =
  (sessionService: SessionService): MiddlewareHandler =>
  async (c, next) => {
    const id = getCookie(c, "id");
    if (id) {
      // If a session cookie is present
      try {
        // Refresh the cookie on the server and append the user to the response
        const { eol, user } = await sessionService.refreshAndGetUser(id);
        c.set("user", user);
        if (!eol)
          // Refresh the cookie on the client only if it is not at the end of its life
          setCookie(c, "id", id, { ...sessionCookieOptions, maxAge: 1000 * SessionService.SESSION_TTL });
      } catch (e) {
        // If we encountered an error, the token was invalid, so we delete the cookie
        deleteCookie(c, "id", sessionCookieOptions);
      }
    }
    await next();
  };

const root = path.join(__dirname, "public").replace(process.cwd(), ".");

/**
 * Serves the static files of the SPA and sets the correct cache control headers.
 * @param c The Hono context.
 * @param next The next middleware handler.
 */
export const staticFileHandler: MiddlewareHandler[] = [
  // Serve static files
  serveStatic({
    root,
    // Serve different favicons to easily distinguish between development and production servers.
    rewriteRequestPath: (path) =>
      process.env.NODE_ENV === "development"
        ? /* c8 ignore next */ // This mapping is only active in a development environment, not during tests.
          (path = path.replace(/^\/assets\/images\/favicon/, "/assets/images/favicon-dev"))
        : path,
    precompressed: true,
    // Allow caching of static assets excluding the SPA
    onFound: (_, c) =>
      /* c8 ignore next */ // Static assets are not covered by tests.
      c.req.path.startsWith("/assets") ? c.header("Cache-Control", "public, max-age=31536000") : undefined,
  }),
  // Only if no such file exists:
  serveStatic({
    root,
    // Serve the SPA to any route not belonging to the API
    rewriteRequestPath: (path) => path.replace(/^(?!\/api).+/, "/"),
    precompressed: true,
  }),
];
