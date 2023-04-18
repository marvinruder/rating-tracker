import { NextFunction, Request, Response, Router as expressRouter } from "express";
import APIError from "./apiError.js";
export const router = expressRouter();
import rateLimit from "express-rate-limit";

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

const Router = <This>(options: RouterOptions): any => {
  return (
    controllerFn: (...args: [Request, Response]) => void | Promise<void>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: ClassMethodDecoratorContext<This, (...args: [Request, Response]) => void | Promise<void>>
  ) => {
    const controllerFnWithAccessRightCheck = async (req: Request, res: Response, next: NextFunction) => {

*/

/**
 * A router decorator. Allows for decorating controller methods with routing information.
 * @param {RouterOptions} options The router options.
 * @returns {any} some decorator magic
 */
const Router = <This>(options: RouterOptions): any => {
  return (controllerClass: This, controllerFnName: string) => {
    const controllerFn = controllerClass[controllerFnName];
    const controllerFnWithAccessRightCheck = async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (
          !options.accessRights || // Public Routes do not require an access right check
          // Check if the user is authenticated and has the required access rights for the endpoint
          res.locals.user?.hasAccessRight(options.accessRights) ||
          res.locals.userIsCron // Allow Cron jobs to access all endpoints
        ) {
          await controllerFn(req, res);
        } else {
          throw new APIError(
            // Use the correct error code and message based on whether a user is authenticated.
            res.locals.user ? 403 : 401,
            res.locals.user
              ? "The authenticated user account does not have the rights necessary to access this endpoint."
              : "This endpoint is available to authenticated clients only. Please sign in."
          );
        }
      } catch (err) {
        next(err);
      }
    };
    options.rateLimited
      ? router[options.method](options.path, rateLimiter, controllerFnWithAccessRightCheck)
      : router[options.method](options.path, controllerFnWithAccessRightCheck);
  };
};

export default Router;
