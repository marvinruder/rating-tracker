import { Router } from "express";
import AuthRouter from "./auth/AuthRouter.js";
import FetchRouter from "./fetch/FetchRouter.js";
import StockRouter from "./stock/StockRouter.js";

class PublicRouter {
  private _router = Router();
  private _subrouterAuth = AuthRouter;

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
    this._router.use("/auth", this._subrouterAuth);
    this._router.get("/status", (req, res) => {
      return res.status(200).json({ status: "operational" });
    });
  }
}

class PrivateRouter {
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
    this._router.head("/session", (_, res) => {
      return res.sendStatus(204);
    });
  }
}

export default {
  public: new PublicRouter().router,
  private: new PrivateRouter().router,
};
