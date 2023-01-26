/* istanbul ignore file */
import { Request, Response, Router } from "express";
import FetchController from "../../controllers/FetchController.js";
import "express-async-errors";

/**
 * Router for fetch routes.
 */
class FetchRouter {
  private _router = Router();
  private _controller = FetchController;

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
    this._router.get("/morningstar", async (req: Request, res: Response) => {
      await this._controller.fetchMorningstarData(req, res);
    });
    this._router.get("/marketscreener", async (req: Request, res: Response) => {
      await this._controller.fetchMarketScreenerData(req, res);
    });
    this._router.get("/msci", async (req: Request, res: Response) => {
      await this._controller.fetchMSCIData(req, res);
    });
    this.router.get("/refinitiv", async (req: Request, res: Response) => {
      await this._controller.fetchRefinitivData(req, res);
    });
    this._router.get("/sp", async (req: Request, res: Response) => {
      await this._controller.fetchSPData(req, res);
    });
    this._router.get("/sustainalytics", async (req: Request, res: Response) => {
      await this._controller.fetchSustainalyticsData(req, res);
    });
  }
}

export default new FetchRouter().router;
