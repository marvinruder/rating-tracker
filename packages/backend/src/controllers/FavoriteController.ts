import { Request, Response } from "express";
import { GENERAL_ACCESS, favoriteEndpointPath, favoriteListEndpointPath } from "@rating-tracker/commons";
import Router from "../utils/router";
import { readFavorites, updateWatchlist } from "../db/tables/watchlistTable";

/**
 * This class is responsible for handling favorites.
 */
export class FavoriteController {
  /**
   * Returns the list of favorites of the current user.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: favoriteListEndpointPath,
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
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: favoriteEndpointPath + "/*",
    method: "put",
    accessRights: GENERAL_ACCESS,
  })
  async put(req: Request, res: Response) {
    const { id } = await readFavorites(res.locals.user.email);
    await updateWatchlist(id, res.locals.user.email, {}, [req.params[0]], []);
    res.status(201).end();
  }

  /**
   * Removes a stock from the favorites of the current user.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: favoriteEndpointPath + "/*",
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async delete(req: Request, res: Response) {
    const { id } = await readFavorites(res.locals.user.email);
    await updateWatchlist(id, res.locals.user.email, {}, [], [req.params[0]]);
    res.status(204).end();
  }
}
