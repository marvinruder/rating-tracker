import { FORBIDDEN_ERROR_MESSAGE, UNAUTHORIZED_ERROR_MESSAGE } from "@rating-tracker/commons";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Router as expressRouter } from "express";
import rateLimit from "express-rate-limit";

import APIError from "./APIError";
export const router = expressRouter();

/**
 * Rate limiter in use by authentication routes.
 */
const rateLimiter = rateLimit({ windowMs: 1000 * 60, max: 60 });

/**
 * The options for a router.
 */
interface RouterOptions {
  /**
   * The path of the API endpoint.
   */
  path: string;
  /**
   * The HTTP method.
   */
  method: "get" | "head" | "post" | "put" | "patch" | "delete";
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

/*

// This way of using stable decorators is not yet supported by Vite(st).

export default Router = <This>(options: RouterOptions): any => {
  return (
    controllerFn: (...args: [Request, Response]) => void | Promise<void>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: ClassMethodDecoratorContext<This, (...args: [Request, Response]) => void | Promise<void>>
  ) => {
    const controllerFnWithAccessRightCheck = async (req: Request, res: Response, next: NextFunction) => {

*/

/**
 * A router decorator. Allows for decorating controller methods with routing information.
 *
 * @param {RouterOptions} options The router options.
 * @returns {any} some decorator magic
 */
export default <This>(options: RouterOptions): any => {
  return (controllerClass: This, controllerFnName: string) => {
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
    const controllerFn: RequestHandler = (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(controllerClass[controllerFnName](req, res, next)).catch(next);

    const requestHandlers = [accessRightCheck] satisfies RequestHandler[];
    if (options.rateLimited) requestHandlers.push(rateLimiter);
    if (options.bodyParser) requestHandlers.push(options.bodyParser);
    router[options.method](options.path, ...requestHandlers, controllerFn);
  };
};
