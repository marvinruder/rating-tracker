import { Request, Response, Router } from "express";
import UserController from "../../controllers/UserController.js";
import "express-async-errors";

/**
 * Router for user routes
 */
class UserRouter {
  private _router = Router();
  private _controller = UserController;

  /**
   * Get the router for user routes.
   *
   * @returns {Router} The router for user routes.
   */
  get router() {
    return this._router;
  }

  /**
   * Creates a new user router.
   */
  constructor() {
    this._configure();
  }

  /**
   * Connect routes to their matching controller endpoints.
   */
  private _configure() {
    this._router.get("/*", async (req: Request, res: Response) => {
      await this._controller.get(req, res);
    });
    this._router.patch("/*", async (req: Request, res: Response) => {
      await this._controller.patch(req, res);
    });
    this._router.delete("/*", async (req: Request, res: Response) => {
      await this._controller.delete(req, res);
    });
  }
}

export default new UserRouter().router;
