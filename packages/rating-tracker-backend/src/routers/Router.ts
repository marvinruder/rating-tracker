import { Router } from "express";
import StockRouter from "./stock/StockRouter.js";

class MainRouter {
  private _router = Router();
  private _subrouterStock = StockRouter;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  /**
   * Connect routes to their matching routers.
   */
  private _configure() {
    this._router.use("/stock", this._subrouterStock);
  }
}

export default new MainRouter().router;
