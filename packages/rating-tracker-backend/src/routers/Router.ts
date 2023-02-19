import { Router } from "express";
import AuthRouter from "./auth/AuthRouter.js";
import FetchRouter from "./fetch/FetchRouter.js";
import ResourceRouter from "./resource/ResourceRouter.js";
import StockRouter from "./stock/StockRouter.js";
import UserManagementRouter from "./userManagement/UserManagementRouter.js";
import UserRouter from "./user/UserRouter.js";
import SessionRouter from "./session/SessionRouter.js";

/**
 * Router for all public routes.
 */
class PublicRouter {
  private _router = Router();
  private _subrouterAuth = AuthRouter;

  /**
   * Get the router for all public routes.
   *
   * @returns {Router} The router for all public routes.
   */
  get router() {
    return this._router;
  }

  /**
   * Creates a new public router.
   */
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
  private _subrouterUserManagement = UserManagementRouter;
  private _subrouterUser = UserRouter;
  private _subrouterSession = SessionRouter;

  /**
   * Get the router for all private routes.
   *
   * @returns {Router} The router for all private routes.
   */
  get router() {
    return this._router;
  }

  /**
   * Creates a new private router.
   */
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
    this._router.use("/user", this._subrouterUser);
    this._router.use("/userManagement", this._subrouterUserManagement);
    this._router.use("/session", this._subrouterSession);
  }
}

/**
 * An object containing two routers for both public and private routes.
 */
export default {
  public: new PublicRouter().router,
  private: new PrivateRouter().router,
};
