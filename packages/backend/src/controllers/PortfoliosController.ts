import { GENERAL_ACCESS, stocksEndpointPath, portfoliosEndpointPath, isCurrency } from "@rating-tracker/commons";
import type { Request, Response } from "express";

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
import Router from "../utils/router";

/**
 * This class is responsible for handling portfolio information.
 */
export class PortfoliosController {
  /**
   * Returns a summary of the portfolios of the current user.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: portfoliosEndpointPath,
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async getSummary(_: Request, res: Response) {
    res
      .status(200)
      .json(await readAllPortfolios(res.locals.user.email))
      .end();
  }

  /**
   * Reads a single portfolio from the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: portfoliosEndpointPath + "/:id",
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async get(req: Request, res: Response) {
    res
      .status(200)
      .json(await readPortfolio(Number(req.params.id), res.locals.user.email))
      .end();
  }

  /**
   * Creates a new portfolio in the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @throws an {@link APIError} if a portfolio with the same ID already exists
   */
  @Router({
    path: portfoliosEndpointPath + "/:id",
    method: "put",
    accessRights: GENERAL_ACCESS,
  })
  async put(req: Request, res: Response) {
    const { id } = req.params;
    const { name, currency } = req.query;
    if (id === "new" && typeof name === "string" && typeof currency === "string" && isCurrency(currency)) {
      const portfolio = await createPortfolio(name, res.locals.user.email, currency);
      res.status(201).json({ id: portfolio.id }).end();
    }
  }

  /**
   * Updates a portfolio in the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: portfoliosEndpointPath + "/:id",
    method: "patch",
    accessRights: GENERAL_ACCESS,
  })
  async patch(req: Request, res: Response) {
    const { name, currency } = req.query;
    if (
      (typeof name === "string" || typeof name === "undefined") &&
      ((typeof currency === "string" && isCurrency(currency)) || typeof currency === "undefined")
    ) {
      await updatePortfolio(Number(req.params.id), res.locals.user.email, { name, currency });
      res.status(204).end();
    }
  }

  /**
   * Adds a stock to a portfolio in the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: portfoliosEndpointPath + "/:id" + stocksEndpointPath + "/:ticker",
    method: "put",
    accessRights: GENERAL_ACCESS,
  })
  async addStock(req: Request, res: Response) {
    const amount = Number(req.query.amount);
    if (typeof amount === "number" && !Number.isNaN(amount)) {
      await addStockToPortfolio(Number(req.params.id), res.locals.user.email, {
        ticker: req.params.ticker,
        amount,
      });
      res.status(204).end();
    }
  }

  /**
   * Updates a stock in a portfolio in the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: portfoliosEndpointPath + "/:id" + stocksEndpointPath + "/:ticker",
    method: "patch",
    accessRights: GENERAL_ACCESS,
  })
  async updateStock(req: Request, res: Response) {
    const amount = req.query.amount ? Number(req.query.amount) : undefined;
    if ((typeof amount === "number" && !Number.isNaN(amount)) || typeof amount === "undefined") {
      await updateStockInPortfolio(Number(req.params.id), res.locals.user.email, req.params.ticker, { amount });
      res.status(204).end();
    }
  }

  /**
   * Removes a stock from a portfolio in the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: portfoliosEndpointPath + "/:id" + stocksEndpointPath + "/:ticker",
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async removeStock(req: Request, res: Response) {
    await removeStockFromPortfolio(Number(req.params.id), res.locals.user.email, req.params.ticker);
    res.status(204).end();
  }

  /**
   * Deletes a portfolio from the database.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   */
  @Router({
    path: portfoliosEndpointPath + "/:id",
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async delete(req: Request, res: Response) {
    await deletePortfolio(Number(req.params.id), res.locals.user.email);
    res.status(204).end();
  }
}
