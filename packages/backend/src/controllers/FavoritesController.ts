import { GENERAL_ACCESS, favoritesEndpointPath } from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";

import { addStockToWatchlist, readFavorites, removeStockFromWatchlist } from "../db/tables/watchlistTable";
import * as stock from "../openapi/parameters/stock";
import { notFound, unauthorized } from "../openapi/responses/clientError";
import { created, noContent, okWatchlist } from "../openapi/responses/success";
import Endpoint from "../utils/Endpoint";
import Singleton from "../utils/Singleton";

/**
 * This class is responsible for handling favorites.
 */
class FavoritesController extends Singleton {
  /**
   * Returns the list of favorites of the current user.
   * @param _ The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Favorites API"],
      operationId: "getFavorites",
      summary: "Get the Favorites watchlist",
      description: "Returns the list of favorites of the current user.",
      responses: { "200": okWatchlist, "401": unauthorized },
    },
    method: "get",
    path: favoritesEndpointPath,
    accessRights: GENERAL_ACCESS,
  })
  get: RequestHandler = async (_: Request, res: Response) => {
    res
      .status(200)
      .json(await readFavorites(res.locals.user.email))
      .end();
  };

  /**
   * Adds a stock to the favorites of the current user.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Favorites API"],
      operationId: "putFavorite",
      summary: "Add a stock to the Favorites watchlist",
      description: "Adds a stock to the favorites of the current user.",
      parameters: [{ ...stock.ticker, in: "path", required: true }],
      responses: { "201": created, "401": unauthorized, "404": notFound },
    },
    method: "put",
    path: favoritesEndpointPath + "/{ticker}",
    accessRights: GENERAL_ACCESS,
  })
  put: RequestHandler = async (req: Request, res: Response) => {
    const { id } = await readFavorites(res.locals.user.email);
    await addStockToWatchlist(id, res.locals.user.email, req.params.ticker);
    res.status(201).end();
  };

  /**
   * Removes a stock from the favorites of the current user.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Favorites API"],
      operationId: "deleteFavorite",
      summary: "Remove a stock from the Favorites watchlist",
      description: "Removes a stock from the favorites of the current user.",
      parameters: [{ ...stock.ticker, in: "path", required: true }],
      responses: { "204": noContent, "401": unauthorized, "404": notFound },
    },
    method: "delete",
    path: favoritesEndpointPath + "/{ticker}",
    accessRights: GENERAL_ACCESS,
  })
  delete: RequestHandler = async (req: Request, res: Response) => {
    const { id } = await readFavorites(res.locals.user.email);
    await removeStockFromWatchlist(id, res.locals.user.email, req.params.ticker);
    res.status(204).end();
  };
}

export default new FavoritesController();
