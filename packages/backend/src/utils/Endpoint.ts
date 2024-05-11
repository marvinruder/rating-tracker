import type { HTTPMethod } from "@rating-tracker/commons";
import { FORBIDDEN_ERROR_MESSAGE, UNAUTHORIZED_ERROR_MESSAGE } from "@rating-tracker/commons";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Router as expressRouter } from "express";
import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import rateLimit from "express-rate-limit";

import OpenAPIDocumentation from "../openapi";

import APIError from "./APIError";
import type Singleton from "./Singleton";
export const router = expressRouter();

/**
 * Rate limiter in use by authentication routes.
 */
const rateLimiter = rateLimit({ windowMs: 1000 * 60, max: 60 });

/**
 * The options for an API endpoint.
 */
interface EndpointOptions {
  /**
   * The specification of the API endpoint.
   */
  spec: OpenAPIV3.OperationObject;
  /**
   * The HTTP method of the API endpoint.
   */
  method: HTTPMethod;
  /**
   * The path of the API endpoint. Must not contain the base URL path (e.g. `/api`).
   * Path parameters must be encoded using the `/{parameter}` syntax.
   */
  path: string;
  /**
   * A parser for the request body.
   */
  bodyParser?: RequestHandler;
  /**
   * The required access rights, encoded as a bitfield.
   */
  accessRights: number;
  /**
   * Whether the rate limiter shall protect this route.
   */
  rateLimited?: boolean;
}

/**
 * A router decorator. Allows for decorating controller methods with routing information.
 * @param options The router options.
 * @returns A function whose first parameter is a request handler. It will wrap the request handler with the necessary
 *          middleware such as access right checker, rate limiter, or body parser, and add it to the router.
 */
const Endpoint = (
  options: EndpointOptions,
): ((
  value: undefined,
  context: ClassFieldDecoratorContext<Singleton, RequestHandler>,
) => (requestHandler: RequestHandler) => RequestHandler) => {
  OpenAPIDocumentation.addEndpoint(options.method, options.path, options.spec);

  const accessRightCheck: RequestHandler = (_: Request, res: Response, next: NextFunction) =>
    !options.accessRights || // Public Routes do not require an access right check
    // Check if the user is authenticated and has the required access rights for the endpoint
    res.locals.user?.hasAccessRight(options.accessRights) ||
    res.locals.userIsCron // Allow Cron jobs to access all endpoints
      ? next()
      : next(
          new APIError(
            // Use the correct error code and message based on whether a user is authenticated.
            res.locals.user ? 403 : 401,
            res.locals.user ? FORBIDDEN_ERROR_MESSAGE : UNAUTHORIZED_ERROR_MESSAGE,
          ),
        );

  return () => (requestHandler: RequestHandler) => {
    const requestHandlers = [accessRightCheck] satisfies RequestHandler[];
    if (options.rateLimited) requestHandlers.push(rateLimiter);
    if (options.bodyParser) requestHandlers.push(options.bodyParser);
    router[options.method](options.path.replaceAll(/\{(\w+)\}/g, ":$1"), ...requestHandlers, (req, res, next) =>
      Promise.resolve(requestHandler(req, res, next)).catch(next),
    );
    return requestHandler;
  };
};

export default Endpoint;
