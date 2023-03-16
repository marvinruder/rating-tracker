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

/**
 * A router decorator. Allows for decorating controller methods with routing information.
 *
 * @param {RouterOptions} options The router options.
 * @returns {void}
 */
const Router = (options: RouterOptions) => {
  return (target: any, propertyKey: string) => {
    const controller = target[propertyKey];
    const controllerWithAccessRightCheck = async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (
          !options.accessRights || // Public Routes do not require an access right check
          // Check if the user is authenticated and has the required access rights for the endpoint
          res.locals.user?.hasAccessRight(options.accessRights) ||
          res.locals.userIsCron // Allow Cron jobs to access all endpoints
        ) {
          await controller(req, res);
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
      ? router[options.method](options.path, rateLimiter, controllerWithAccessRightCheck)
      : router[options.method](options.path, controllerWithAccessRightCheck);
  };
};

export default Router;
