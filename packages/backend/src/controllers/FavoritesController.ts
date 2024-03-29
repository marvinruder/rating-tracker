import { GENERAL_ACCESS, favoritesEndpointPath } from "@rating-tracker/commons";
import type { Request, Response } from "express";

import { addStockToWatchlist, readFavorites, removeStockFromWatchlist } from "../db/tables/watchlistTable";
import Router from "../utils/router";

/**
 * This class is responsible for handling favorites.
 */
export class FavoritesController {
  /**
   * Returns the list of favorites of the current user.
   * @param _ The request.
   * @param res The response.
   */
  @Router({
    path: favoritesEndpointPath,
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async get(_: Request, res: Response) {
    res
      .status(200)
      .json(await readFavorites(res.locals.user.email))
      .end();
  }

  /**
   * Adds a stock to the favorites of the current user.
   * @param req The request.
   * @param res The response.
   */
  @Router({
    path: favoritesEndpointPath + "/:ticker",
    method: "put",
    accessRights: GENERAL_ACCESS,
  })
  async put(req: Request, res: Response) {
    const { id } = await readFavorites(res.locals.user.email);
    await addStockToWatchlist(id, res.locals.user.email, req.params.ticker);
    res.status(201).end();
  }

  /**
   * Removes a stock from the favorites of the current user.
   * @param req The request.
   * @param res The response.
   */
  @Router({
    path: favoritesEndpointPath + "/:ticker",
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async delete(req: Request, res: Response) {
    const { id } = await readFavorites(res.locals.user.email);
    await removeStockFromWatchlist(id, res.locals.user.email, req.params.ticker);
    res.status(204).end();
  }
}
