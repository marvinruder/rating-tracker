import { Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import "express-async-errors";
import AuthController from "../../controllers/AuthController.js";

const authLimiter = rateLimit({ windowMs: 1000 * 60, max: 60 });

class AuthRouter {
  private _router = Router();
  private _controller = AuthController;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  /**
   * Connect routes to their matching controller endpoints.
   */
  private _configure() {
    this._router.get(
      "/register",
      authLimiter,
      async (req: Request, res: Response) => {
        await this._controller.getRegistrationOptions(req, res);
      }
    );
    /* istanbul ignore next */
    this._router.post(
      "/register",
      authLimiter,
      async (req: Request, res: Response) => {
        await this._controller.postRegistrationResponse(req, res);
      }
    );
    this._router.get(
      "/signIn",
      authLimiter,
      async (req: Request, res: Response) => {
        await this._controller.getAuthenticationOptions(req, res);
      }
    );
    /* istanbul ignore next */
    this._router.post(
      "/signIn",
      authLimiter,
      async (req: Request, res: Response) => {
        await this._controller.postAuthenticationResponse(req, res);
      }
    );
  }
}

export default new AuthRouter().router;
