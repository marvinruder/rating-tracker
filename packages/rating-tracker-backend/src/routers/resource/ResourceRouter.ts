import { Request, Response, Router } from "express";
import ResourceController from "../../controllers/ResourceController.js";
import "express-async-errors";

/**
 * Router for resource routes.
 */
class ResourceRouter {
  private _router = Router();
  private _controller = ResourceController;

  /**
   * Get the router for resource routes.
   *
   * @returns {Router} The router for resource routes.
   */
  get router() {
    return this._router;
  }

  /**
   * Creates a new resource router.
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
  }
}

export default new ResourceRouter().router;
