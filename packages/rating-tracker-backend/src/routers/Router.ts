import { Router } from "express";
import FetchRouter from "./fetch/FetchRouter.js";
import StockRouter from "./stock/StockRouter.js";

class MainRouter {
  private _router = Router();
  private _subrouterFetch = FetchRouter;
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
    this._router.use("/fetch", this._subrouterFetch);
    this._router.use("/stock", this._subrouterStock);
  }
}

export default new MainRouter().router;
