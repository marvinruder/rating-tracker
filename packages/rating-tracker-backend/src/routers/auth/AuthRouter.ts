import { Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import "express-async-errors";
import AuthController from "../../controllers/AuthController.js";

/**
 * Rate limiter for authentication routes.
 */
const authLimiter = rateLimit({ windowMs: 1000 * 60, max: 60 });

/**
 * Router for authentication routes.
 */
class AuthRouter {
  private _router = Router();
  private _controller = AuthController;

  /**
   * Get the router for authentication routes.
   *
   * @returns {Router} The router for authentication routes.
   */
  get router() {
    return this._router;
  }

  /**
   * Creates a new authentication router.
   */
  constructor() {
    this._configure();
  }

  /**
   * Connect routes to their matching controller endpoints.
   */
  private _configure() {
    this._router.get("/register", authLimiter, async (req: Request, res: Response) => {
      await this._controller.getRegistrationOptions(req, res);
    });
    // This function is not tested because it is difficult to mock creating a valid challenge response.
    /* istanbul ignore next -- @preserve */
    this._router.post("/register", authLimiter, async (req: Request, res: Response) => {
      await this._controller.postRegistrationResponse(req, res);
    });
    this._router.get("/signIn", authLimiter, async (req: Request, res: Response) => {
      await this._controller.getAuthenticationOptions(req, res);
    });
    // This function is not tested because it is difficult to mock creating a valid challenge response.
    /* istanbul ignore next -- @preserve */
    this._router.post("/signIn", authLimiter, async (req: Request, res: Response) => {
      await this._controller.postAuthenticationResponse(req, res);
    });
  }
}

export default new AuthRouter().router;
