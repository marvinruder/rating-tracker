import { Request, Response, Router } from "express";
import SessionController from "../../controllers/SessionController.js";
import "express-async-errors";

/**
 * Router for session routes
 */
class SessionRouter {
  private _router = Router();
  private _controller = SessionController;

  /**
   * Get the router for session routes.
   *
   * @returns {Router} The router for session routes.
   */
  get router() {
    return this._router;
  }

  /**
   * Creates a new session router.
   */
  constructor() {
    this._configure();
  }

  /**
   * Connect routes to their matching controller endpoints.
   */
  private _configure() {
    this._router.head("", (_: Request, res: Response) => {
      // The trivial session route is implemented directly in the router.
      // If not authenticated, a 401 response would have been returned before this route is reached here.
      // If authenticated, this route is reached and a 204 response is returned.
      return res.status(204).end();
    });
    this._router.delete("", async (req: Request, res: Response) => {
      await this._controller.delete(req, res);
    });
  }
}

export default new SessionRouter().router;
