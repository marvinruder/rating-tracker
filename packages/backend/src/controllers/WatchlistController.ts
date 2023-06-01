import { Request, Response } from "express";
import { GENERAL_ACCESS, watchlistEndpointPath, watchlistSummaryEndpointPath } from "@rating-tracker/commons";
import Router from "../utils/router.js";
import {
  FAVORITES_NAME,
  createWatchlist,
  deleteWatchlist,
  readAllWatchlists,
  readWatchlist,
  updateWatchlist,
} from "../db/tables/watchlistTable.js";

/**
 * This class is responsible for handling watchlist information.
 */
export class WatchlistController {
  /**
   * Returns a summary of the watchlists of the current user.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: watchlistSummaryEndpointPath,
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async getSummary(_: Request, res: Response) {
    res
      .status(200)
      .json(
        (await readAllWatchlists(res.locals.user.email)).sort((a, b) =>
          // Sort the watchlists alphabetically, with the Favorites watchlist at the top
          a.name === FAVORITES_NAME ? -1 : b.name === FAVORITES_NAME ? 1 : a.name.localeCompare(b.name)
        )
      )
      .end();
  }

  /**
   * Reads a single watchlist from the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: watchlistEndpointPath + "/*",
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async get(req: Request, res: Response) {
    res
      .status(200)
      .json(await readWatchlist(Number(req.params[0]), res.locals.user.email))
      .end();
  }

  /**
   * Creates a new watchlist in the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @throws an {@link APIError} if a watchlist with the same ID already exists
   */
  @Router({
    path: watchlistEndpointPath + "/*",
    method: "put",
    accessRights: GENERAL_ACCESS,
  })
  async put(req: Request, res: Response) {
    const id = req.params[0];
    const { name } = req.query;
    if (id === "new" && typeof name === "string") {
      const watchlist = await createWatchlist(name, res.locals.user.email);
      res.status(201).json({ id: watchlist.id }).end();
    }
  }

  /**
   * Updates a watchlist in the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: watchlistEndpointPath + "/*",
    method: "patch",
    accessRights: GENERAL_ACCESS,
  })
  async patch(req: Request, res: Response) {
    const id = Number(req.params[0]);
    const { name, subscribed, stocksToAdd, stocksToRemove } = req.query;
    if (
      (typeof name === "string" || typeof name === "undefined") &&
      (typeof subscribed === "undefined" || typeof subscribed === "boolean") &&
      (typeof stocksToAdd === "undefined" || Array.isArray(stocksToAdd)) &&
      (typeof stocksToRemove === "undefined" || Array.isArray(stocksToRemove))
    ) {
      await updateWatchlist(
        id,
        res.locals.user.email,
        { name, subscribed },
        (stocksToAdd as string[] | undefined) ?? [],
        (stocksToRemove as string[] | undefined) ?? []
      );
      res.status(204).end();
    }
  }

  /**
   * Deletes a watchlist from the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: watchlistEndpointPath + "/*",
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async delete(req: Request, res: Response) {
    await deleteWatchlist(Number(req.params[0]), res.locals.user.email);
    res.status(204).end();
  }
}
