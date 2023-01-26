import { Router } from "express";
import AuthRouter from "./auth/AuthRouter.js";
import FetchRouter from "./fetch/FetchRouter.js";
import ResourceRouter from "./resource/ResourceRouter.js";
import StockRouter from "./stock/StockRouter.js";

/**
 * Router for all public routes.
 */
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
   * Connect routes to their matching subrouters.
   */
  private _configure() {
    this._router.use("/auth", this._subrouterAuth);
    this._router.get("/status", (_, res) => {
      // The trivial status route is implemented directly in the router.
      return res.status(200).json({ status: "operational" });
    });
  }
}

/**
 * Router for all private routes. Requests arriving here have already been verified to originate from an authenticated
 * user.
 */
class PrivateRouter {
  private _router = Router();
  private _subrouterFetch = FetchRouter;
  private _subrouterStock = StockRouter;
  private _subrouterResource = ResourceRouter;

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
    this._router.use("/resource", this._subrouterResource);
    this._router.head("/session", (_, res) => {
      // The trivial session route is implemented directly in the router.
      // If not authenticated, a 401 response would have been returned before this route is reached here.
      // If authenticated, this route is reached and a 204 response is returned.
      return res.sendStatus(204);
    });
  }
}

/**
 * An object containing two routers for both public and private routes.
 */
export default {
  public: new PublicRouter().router,
  private: new PrivateRouter().router,
};
