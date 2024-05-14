import type { HTTPMethod } from "@rating-tracker/commons";
import { FORBIDDEN_ERROR_MESSAGE, UNAUTHORIZED_ERROR_MESSAGE } from "@rating-tracker/commons";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Router as expressRouter } from "express";
import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import rateLimit from "express-rate-limit";

import type SingletonController from "../controllers/SingletonController";
import OpenAPIDocumentation from "../openapi";

import APIError from "./APIError";
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
   * The path of the API endpoint. Must not contain the base URL path (e.g. `/api`) or the controller’s base path.
   * Path parameters must be encoded using the `/{parameter}` syntax.
   */
  path: string;
  /**
   * Whether not to use the controller’s base path.
   */
  ignoreBasePath?: boolean;
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
 * An endpoint decorator. Allows for decorating controller methods with routing, access control, specification, and more
 * information.
 * @param options The endpoint options.
 * @returns The decorator function, operating on the controller method.
 */
const Endpoint = (
  options: EndpointOptions,
): ((
  value: undefined,
  context: ClassFieldDecoratorContext<SingletonController, RequestHandler>,
) => (requestHandler: RequestHandler) => RequestHandler) => {
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

  return () =>
    function (requestHandler: RequestHandler) {
      // eslint-disable-next-line no-invalid-this
      const controller: SingletonController = this;
      const fullPath = options.ignoreBasePath ? options.path : controller.path + options.path;
      OpenAPIDocumentation.addEndpoint(options.method, fullPath, { tags: controller.tags, ...options.spec });

      const requestHandlers = [accessRightCheck] satisfies RequestHandler[];
      if (options.rateLimited) requestHandlers.push(rateLimiter);
      if (options.bodyParser) requestHandlers.push(options.bodyParser);
      router[options.method](fullPath.replaceAll(/\{(\w+)\}/g, ":$1"), ...requestHandlers, (req, res, next) =>
        Promise.resolve(requestHandler(req, res, next)).catch(next),
      );
      return requestHandler;
    };
};

export default Endpoint;
