import { GENERAL_ACCESS, stocksEndpointPath, portfoliosEndpointPath, isCurrency } from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";

import {
  addStockToPortfolio,
  createPortfolio,
  deletePortfolio,
  readAllPortfolios,
  readPortfolio,
  removeStockFromPortfolio,
  updatePortfolio,
  updateStockInPortfolio,
} from "../db/tables/portfolioTable";
import * as portfolio from "../openapi/parameters/portfolio";
import * as stock from "../openapi/parameters/stock";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "../openapi/responses/clientError";
import { created, createdPortfolioID, noContent, okPortfolio, okPortfolioSummary } from "../openapi/responses/success";
import APIError from "../utils/APIError";
import Endpoint from "../utils/Endpoint";
import Singleton from "../utils/Singleton";

/**
 * This class is responsible for handling portfolio information.
 */
class PortfoliosController extends Singleton {
  /**
   * Returns a summary of the portfolios of the current user.
   * @param _ The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Portfolios API"],
      operationId: "getPortfolios",
      summary: "Get a summary of all portfolios",
      description: "Returns a summary of the portfolios of the current user.",
      responses: { "200": okPortfolioSummary, "401": unauthorized },
    },
    method: "get",
    path: portfoliosEndpointPath,
    accessRights: GENERAL_ACCESS,
  })
  getSummary: RequestHandler = async (_: Request, res: Response) => {
    res
      .status(200)
      .json(await readAllPortfolios(res.locals.user.email))
      .end();
  };

  /**
   * Reads a single portfolio from the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Portfolios API"],
      operationId: "getPortfolio",
      summary: "Get a portfolio",
      description: "Reads a single portfolio from the database.",
      parameters: [{ ...portfolio.id, in: "path", required: true }],
      responses: { "200": okPortfolio, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "get",
    path: portfoliosEndpointPath + "/{id}",
    accessRights: GENERAL_ACCESS,
  })
  get: RequestHandler = async (req: Request, res: Response) => {
    res
      .status(200)
      .json(await readPortfolio(Number(req.params.id), res.locals.user.email))
      .end();
  };

  /**
   * Creates a new portfolio in the database.
   * @param req Request object
   * @param res Response object
   * @throws an {@link APIError} if a portfolio with the same ID already exists
   */
  @Endpoint({
    spec: {
      tags: ["Portfolios API"],
      operationId: "putPortfolio",
      summary: "Create a new portfolio",
      description: "Creates a new portfolio in the database.",
      parameters: [
        { ...portfolio.name, required: true },
        { ...portfolio.currency, required: true },
      ],
      responses: { "201": createdPortfolioID, "400": badRequest, "401": unauthorized, "409": conflict },
    },
    method: "put",
    path: portfoliosEndpointPath,
    accessRights: GENERAL_ACCESS,
  })
  put: RequestHandler = async (req: Request, res: Response) => {
    const { name, currency } = req.query;
    if (typeof name !== "string" || typeof currency !== "string" || !isCurrency(currency))
      throw new APIError(400, "Invalid query parameters.");
    const portfolio = await createPortfolio(name, res.locals.user.email, currency);
    res.status(201).json({ id: portfolio.id }).end();
  };

  /**
   * Updates a portfolio in the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Portfolios API"],
      operationId: "patchPortfolio",
      summary: "Update a portfolio",
      description: "Updates a portfolio in the database.",
      parameters: [{ ...portfolio.id, in: "path", required: true }, portfolio.name, portfolio.currency],
      responses: { "204": noContent, "400": badRequest, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "patch",
    path: portfoliosEndpointPath + "/{id}",
    accessRights: GENERAL_ACCESS,
  })
  patch: RequestHandler = async (req: Request, res: Response) => {
    const { name, currency } = req.query;
    if (
      (typeof name !== "string" && typeof name !== "undefined") ||
      ((typeof currency !== "string" || !isCurrency(currency)) && typeof currency !== "undefined")
    )
      throw new APIError(400, "Invalid query parameters.");
    await updatePortfolio(Number(req.params.id), res.locals.user.email, { name, currency });
    res.status(204).end();
  };

  /**
   * Adds a stock to a portfolio in the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Portfolios API"],
      operationId: "putStockToPortfolio",
      summary: "Add a stock to a portfolio",
      description: "Adds a stock to a portfolio in the database.",
      parameters: [
        { ...portfolio.id, in: "path", required: true },
        { ...stock.ticker, in: "path", required: true },
        { ...stock.amount, required: true },
      ],
      responses: { "201": created, "401": unauthorized, "403": forbidden, "404": notFound, "409": conflict },
    },
    method: "put",
    path: portfoliosEndpointPath + "/{id}" + stocksEndpointPath + "/{ticker}",
    accessRights: GENERAL_ACCESS,
  })
  addStock: RequestHandler = async (req: Request, res: Response) => {
    const amount = Number(req.query.amount);
    if (typeof amount !== "number" || Number.isNaN(amount)) throw new APIError(400, "Invalid query parameters.");
    await addStockToPortfolio(Number(req.params.id), res.locals.user.email, {
      ticker: req.params.ticker,
      amount,
    });
    res.status(204).end();
  };

  /**
   * Updates a stock in a portfolio in the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Portfolios API"],
      operationId: "patchStockInPortfolio",
      summary: "Update a stock in a portfolio",
      description: "Updates a stock in a portfolio in the database.",
      parameters: [
        { ...portfolio.id, in: "path", required: true },
        { ...stock.ticker, in: "path", required: true },
        stock.amount,
      ],
      responses: { "204": noContent, "401": unauthorized, "403": forbidden, "404": notFound, "409": conflict },
    },
    method: "patch",
    path: portfoliosEndpointPath + "/{id}" + stocksEndpointPath + "/{ticker}",
    accessRights: GENERAL_ACCESS,
  })
  updateStock: RequestHandler = async (req: Request, res: Response) => {
    const amount = req.query.amount ? Number(req.query.amount) : undefined;
    if ((typeof amount !== "number" || Number.isNaN(amount)) && typeof amount !== "undefined")
      throw new APIError(400, "Invalid query parameters.");
    await updateStockInPortfolio(Number(req.params.id), res.locals.user.email, req.params.ticker, { amount });
    res.status(204).end();
  };

  /**
   * Removes a stock from a portfolio in the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Portfolios API"],
      operationId: "deleteStockFromPortfolio",
      summary: "Remove a stock from a portfolio",
      description: "Removes a stock from a portfolio in the database.",
      parameters: [
        { ...portfolio.id, in: "path", required: true },
        { ...stock.ticker, in: "path", required: true },
      ],
      responses: { "204": noContent, "401": unauthorized, "403": forbidden, "404": notFound, "409": conflict },
    },
    method: "delete",
    path: portfoliosEndpointPath + "/{id}" + stocksEndpointPath + "/{ticker}",
    accessRights: GENERAL_ACCESS,
  })
  removeStock: RequestHandler = async (req: Request, res: Response) => {
    await removeStockFromPortfolio(Number(req.params.id), res.locals.user.email, req.params.ticker);
    res.status(204).end();
  };

  /**
   * Deletes a portfolio from the database.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Portfolios API"],
      operationId: "deletePortfolio",
      summary: "Delete a portfolio",
      description: "Deletes a portfolio from the database.",
      parameters: [{ ...portfolio.id, in: "path", required: true }],
      responses: { "204": noContent, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "delete",
    path: portfoliosEndpointPath + "/{id}",
    accessRights: GENERAL_ACCESS,
  })
  delete: RequestHandler = async (req: Request, res: Response) => {
    await deletePortfolio(Number(req.params.id), res.locals.user.email);
    res.status(204).end();
  };
}

export default new PortfoliosController();
