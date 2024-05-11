import { FAVORITES_NAME, GENERAL_ACCESS, stocksEndpointPath, watchlistsEndpointPath } from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";

import {
  addStockToWatchlist,
  createWatchlist,
  deleteWatchlist,
  readAllWatchlists,
  readWatchlist,
  removeStockFromWatchlist,
  updateWatchlist,
} from "../db/tables/watchlistTable";
import * as stock from "../openapi/parameters/stock";
import * as watchlist from "../openapi/parameters/watchlist";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "../openapi/responses/clientError";
import { created, createdWatchlistID, noContent, okWatchlist, okWatchlistSummary } from "../openapi/responses/success";
import APIError from "../utils/APIError";
import Endpoint from "../utils/Endpoint";
import Singleton from "../utils/Singleton";

/**
 * This class is responsible for handling watchlist information.
 */
class WatchlistsController extends Singleton {
  /**
   * Returns a summary of the watchlists of the current user.
   * @param _ The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Watchlists API"],
      operationId: "getWatchlists",
      summary: "Get a summary of all watchlists",
      description: "Returns a summary of the watchlists of the current user.",
      responses: { "200": okWatchlistSummary, "401": unauthorized },
    },
    method: "get",
    path: watchlistsEndpointPath,
    accessRights: GENERAL_ACCESS,
  })
  getSummary: RequestHandler = async (_: Request, res: Response) => {
    res
      .status(200)
      .json(
        (await readAllWatchlists(res.locals.user.email)).sort((a, b) =>
          // Sort the Favorites watchlist to the top
          a.name === FAVORITES_NAME ? -1 : b.name === FAVORITES_NAME ? 1 : 0,
        ),
      )
      .end();
  };

  /**
   * Reads a single watchlist from the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Watchlists API"],
      operationId: "getWatchlist",
      summary: "Get a watchlist",
      description: "Reads a single watchlist from the database.",
      parameters: [{ ...watchlist.id, in: "path", required: true }],
      responses: { "200": okWatchlist, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "get",
    path: watchlistsEndpointPath + "/{id}",
    accessRights: GENERAL_ACCESS,
  })
  get: RequestHandler = async (req: Request, res: Response) => {
    res
      .status(200)
      .json(await readWatchlist(Number(req.params.id), res.locals.user.email))
      .end();
  };

  /**
   * Creates a new watchlist in the database.
   * @param req Request object
   * @param res Response object
   * @throws an {@link APIError} if a watchlist with the same ID already exists
   */
  @Endpoint({
    spec: {
      tags: ["Watchlists API"],
      operationId: "putWatchlist",
      summary: "Create a new watchlist",
      description: "Creates a new watchlist in the database.",
      parameters: [{ ...watchlist.name, required: true }],
      responses: {
        "201": createdWatchlistID,
        "400": badRequest,
        "401": unauthorized,
        "403": forbidden,
        "409": conflict,
      },
    },
    method: "put",
    path: watchlistsEndpointPath,
    accessRights: GENERAL_ACCESS,
  })
  put: RequestHandler = async (req: Request, res: Response) => {
    const { name } = req.query;
    if (typeof name !== "string") throw new APIError(400, "Invalid query parameters.");
    const watchlist = await createWatchlist(name, res.locals.user.email);
    res.status(201).json({ id: watchlist.id }).end();
  };

  /**
   * Updates a watchlist in the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Watchlists API"],
      operationId: "patchWatchlist",
      summary: "Update a watchlist",
      description: "Updates a watchlist in the database.",
      parameters: [{ ...watchlist.id, in: "path", required: true }, watchlist.name, watchlist.subscribed],
      responses: { "204": noContent, "400": badRequest, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "patch",
    path: watchlistsEndpointPath + "/{id}",
    accessRights: GENERAL_ACCESS,
  })
  patch: RequestHandler = async (req: Request, res: Response) => {
    const { name, subscribed } = req.query;
    if (
      (typeof name !== "string" && typeof name !== "undefined") ||
      (typeof subscribed !== "undefined" && typeof subscribed !== "boolean")
    )
      throw new APIError(400, "Invalid query parameters.");
    await updateWatchlist(Number(req.params.id), res.locals.user.email, { name, subscribed });
    res.status(204).end();
  };

  /**
   * Adds a stock to a watchlist in the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Watchlists API"],
      operationId: "putStockToWatchlist",
      summary: "Add a stock to a watchlist",
      description: "Adds a stock to a watchlist in the database.",
      parameters: [
        { ...watchlist.id, in: "path", required: true },
        { ...stock.ticker, in: "path", required: true },
      ],
      responses: { "201": created, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "put",
    path: watchlistsEndpointPath + "/{id}" + stocksEndpointPath + "/{ticker}",
    accessRights: GENERAL_ACCESS,
  })
  addStock: RequestHandler = async (req: Request, res: Response) => {
    await addStockToWatchlist(Number(req.params.id), res.locals.user.email, req.params.ticker);
    res.status(204).end();
  };

  /**
   * Removes a stock from a watchlist in the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Watchlists API"],
      operationId: "deleteStockFromWatchlist",
      summary: "Remove a stock from a watchlist",
      description: "Removes a stock from a watchlist in the database.",
      parameters: [
        { ...watchlist.id, in: "path", required: true },
        { ...stock.ticker, in: "path", required: true },
      ],
      responses: { "204": noContent, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "delete",
    path: watchlistsEndpointPath + "/{id}" + stocksEndpointPath + "/{ticker}",
    accessRights: GENERAL_ACCESS,
  })
  removeStock: RequestHandler = async (req: Request, res: Response) => {
    await removeStockFromWatchlist(Number(req.params.id), res.locals.user.email, req.params.ticker);
    res.status(204).end();
  };

  /**
   * Deletes a watchlist from the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Watchlists API"],
      operationId: "deleteWatchlist",
      summary: "Delete a watchlist",
      description: "Deletes a watchlist from the database.",
      parameters: [{ ...watchlist.id, in: "path", required: true }],
      responses: { "204": noContent, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "delete",
    path: watchlistsEndpointPath + "/{id}",
    accessRights: GENERAL_ACCESS,
  })
  delete: RequestHandler = async (req: Request, res: Response) => {
    await deleteWatchlist(Number(req.params.id), res.locals.user.email);
    res.status(204).end();
  };
}

export default new WatchlistsController();
