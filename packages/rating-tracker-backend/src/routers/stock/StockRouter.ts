import { Request, Response, Router } from "express";
import StockController from "../../controllers/StockController.js";
import "express-async-errors";

/**
 * Router for stock routes.
 */
class StockRouter {
  private _router = Router();
  private _controller = StockController;

  /**
   * Get the router for stock routes.
   *
   * @returns {Router} The router for stock routes.
   */
  get router() {
    return this._router;
  }

  /**
   * Creates a new stock router.
   */
  constructor() {
    this._configure();
  }

  /**
   * Connect routes to their matching controller endpoints.
   */
  private _configure() {
    this._router.get("/list", async (req: Request, res: Response) => {
      await this._controller.getList(req, res);
    });
    this._router.get("/logo/*", async (req: Request, res: Response) => {
      await this._controller.getLogo(req, res);
    });
    this._router.get("/*", async (req: Request, res: Response) => {
      await this._controller.get(req, res);
    });
    this._router.put("/*", async (req: Request, res: Response) => {
      await this._controller.put(req, res);
    });
    this._router.patch("/*", async (req: Request, res: Response) => {
      await this._controller.patch(req, res);
    });
    this._router.delete("/*", async (req: Request, res: Response) => {
      await this._controller.delete(req, res);
    });
  }
}

export default new StockRouter().router;
