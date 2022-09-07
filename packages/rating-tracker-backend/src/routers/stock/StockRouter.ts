import { Request, Response, Router } from "express";
import StockController from "../../controllers/StockController";

class StockRouter {
  private _router = Router();
  private _controller = StockController;

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this._router.get("/details/*", (req: Request, res: Response, next) => {
      this._controller.getDetails(req, res);
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this._router.get("/list", (req: Request, res: Response, next) => {
      res.status(200).json(this._controller.getList());
    });
  }
}

export = new StockRouter().router;
