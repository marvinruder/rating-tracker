import { FAVORITES_NAME, GENERAL_ACCESS, stocksEndpointPath, watchlistsEndpointPath } from "@rating-tracker/commons";
import type { Request, Response } from "express";

import {
  addStockToWatchlist,
  createWatchlist,
  deleteWatchlist,
  readAllWatchlists,
  readWatchlist,
  removeStockFromWatchlist,
  updateWatchlist,
} from "../db/tables/watchlistTable";
import APIError from "../utils/APIError";
import Router from "../utils/router";

/**
 * This class is responsible for handling watchlist information.
 */
export class WatchlistsController {
  /**
   * Returns a summary of the watchlists of the current user.
   * @param _ The request.
   * @param res The response.
   */
  @Router({
    path: watchlistsEndpointPath,
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async getSummary(_: Request, res: Response) {
    res
      .status(200)
      .json(
        (await readAllWatchlists(res.locals.user.email)).sort((a, b) =>
          // Sort the Favorites watchlist to the top
          a.name === FAVORITES_NAME ? -1 : b.name === FAVORITES_NAME ? 1 : 0,
        ),
      )
      .end();
  }

  /**
   * Reads a single watchlist from the database.
   * @param req Request object
   * @param res Response object
   */
  @Router({
    path: watchlistsEndpointPath + "/:id",
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async get(req: Request, res: Response) {
    res
      .status(200)
      .json(await readWatchlist(Number(req.params.id), res.locals.user.email))
      .end();
  }

  /**
   * Creates a new watchlist in the database.
   * @param req Request object
   * @param res Response object
   * @throws an {@link APIError} if a watchlist with the same ID already exists
   */
  @Router({
    path: watchlistsEndpointPath,
    method: "put",
    accessRights: GENERAL_ACCESS,
  })
  async put(req: Request, res: Response) {
    const { name } = req.query;
    if (typeof name !== "string") throw new APIError(400, "Invalid query parameters.");
    const watchlist = await createWatchlist(name, res.locals.user.email);
    res.status(201).json({ id: watchlist.id }).end();
  }

  /**
   * Updates a watchlist in the database.
   * @param req Request object
   * @param res Response object
   */
  @Router({
    path: watchlistsEndpointPath + "/:id",
    method: "patch",
    accessRights: GENERAL_ACCESS,
  })
  async patch(req: Request, res: Response) {
    const { name, subscribed } = req.query;
    if (
      (typeof name !== "string" && typeof name !== "undefined") ||
      (typeof subscribed !== "undefined" && typeof subscribed !== "boolean")
    )
      throw new APIError(400, "Invalid query parameters.");
    await updateWatchlist(Number(req.params.id), res.locals.user.email, { name, subscribed });
    res.status(204).end();
  }

  /**
   * Adds a stock to a watchlist in the database.
   * @param req Request object
   * @param res Response object
   */
  @Router({
    path: watchlistsEndpointPath + "/:id" + stocksEndpointPath + "/:ticker",
    method: "put",
    accessRights: GENERAL_ACCESS,
  })
  async addStock(req: Request, res: Response) {
    await addStockToWatchlist(Number(req.params.id), res.locals.user.email, req.params.ticker);
    res.status(204).end();
  }

  /**
   * Removes a stock from a watchlist in the database.
   * @param req Request object
   * @param res Response object
   */
  @Router({
    path: watchlistsEndpointPath + "/:id" + stocksEndpointPath + "/:ticker",
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async removeStock(req: Request, res: Response) {
    await removeStockFromWatchlist(Number(req.params.id), res.locals.user.email, req.params.ticker);
    res.status(204).end();
  }

  /**
   * Deletes a watchlist from the database.
   * @param req Request object
   * @param res Response object
   */
  @Router({
    path: watchlistsEndpointPath + "/:id",
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async delete(req: Request, res: Response) {
    await deleteWatchlist(Number(req.params.id), res.locals.user.email);
    res.status(204).end();
  }
}
