import type { Currency, Portfolio, PortfolioSummary, Stock, WeightedStock } from "@rating-tracker/commons";

import type {
  Prisma,
  Portfolio as PrismaPortfolio,
  Stock as PrismaStock,
  StocksInPortfolios,
} from "../../../prisma/client";
import APIError from "../../utils/APIError";
import logger from "../../utils/logger";
import client from "../client";

import { readStock } from "./stockTable";

/**
 * Check whether the given user is the owner of the specified portfolio.
 * @param id The ID of the portfolio.
 * @param email The email of the current user.
 * @throws an {@link APIError} if the portfolio does not exist or belong to the user.
 */
const checkPortfolioExistenceAndOwner = async (id: number, email: string) => {
  const portfolio = await client.portfolio.findUnique({ where: { id } });
  if (!portfolio) {
    throw new APIError(404, `Portfolio ${id} not found.`);
  }
  if (portfolio.email !== email) {
    throw new APIError(403, `Portfolio ${id} does not belong to user with email address ${email}.`);
  }
};

/**
 * Create a Portfolio from the object returned by Prisma when querying the explicit many-to-many relation
 * `StocksInPortfolios`.
 * @param portfolio The portfolio object returned by Prisma.
 * @returns The portfolio.
 */
const mapPortfolioFromPrisma = (
  portfolio: Omit<PrismaPortfolio, "email"> & { stocks: (StocksInPortfolios & { stock: PrismaStock })[] },
): Portfolio => ({
  ...portfolio,
  stocks: portfolio.stocks.map((stock) => ({ ...stock.stock, amount: stock.amount })),
});

/**
 * Create a portfolio.
 * @param name The name of the portfolio to create.
 * @param email The email of the current user.
 * @param currency The currency of the portfolio.
 * @returns The created portfolio.
 */
export const createPortfolio = async (name: string, email: string, currency: Currency): Promise<Portfolio> => {
  const portfolio = mapPortfolioFromPrisma(
    await client.portfolio.create({
      data: { name, email, currency },
      select: {
        id: true,
        name: true,
        currency: true,
        stocks: { include: { stock: true }, orderBy: { amount: "desc" } },
      },
    }),
  );
  logger.info({ prefix: "postgres" }, `Created portfolio “${portfolio.name}” with ID ${portfolio.id}.`);
  return portfolio;
};

/**
 * Read a portfolio.
 * @param id The ID of the portfolio.
 * @param email The email of the current user.
 * @returns The portfolio.
 * @throws an {@link APIError} if the portfolio does not exist or belong to the user.
 */
export const readPortfolio = async (id: number, email: string): Promise<Portfolio> => {
  await checkPortfolioExistenceAndOwner(id, email);
  return mapPortfolioFromPrisma(
    await client.portfolio.findUniqueOrThrow({
      select: {
        id: true,
        name: true,
        currency: true,
        stocks: { include: { stock: true }, orderBy: { amount: "desc" } },
      },
      where: { id },
    }),
  );
};

/**
 * Query multiple stocks in a portfolio as well as their count after filtering.
 * @param id The ID of the portfolio.
 * @param email The email of the current user.
 * @param args An object with filtering, sorting and pagination options.
 * @param sortByAmount If set, the direction in which to sort the stocks by their amount.
 * @returns A list of all stocks.
 */
export const readStocksInPortfolio = async (
  id: number,
  email: string,
  args: Prisma.StockFindManyArgs,
  sortByAmount: Prisma.SortOrder | undefined,
): Promise<[WeightedStock[], number]> => {
  await checkPortfolioExistenceAndOwner(id, email);
  const [portfolio, count] = await client.$transaction([
    // First query the portfolio table, so we can…
    client.portfolio.findUniqueOrThrow({
      select: {
        id: true,
        name: true,
        currency: true,
        stocks: {
          where: { stock: args.where },
          // …order by attributes of the m:n relation table if requested, then…
          orderBy: { stock: Array.isArray(args.orderBy) ? undefined : args.orderBy, amount: sortByAmount },
          skip: args.skip,
          take: args.take,
          include: { stock: true },
        },
      },
      where: { id },
    }),
    client.stock.count({
      where: { ...args.where, portfolios: { some: { portfolioID: id, portfolio: { user: { email } } } } },
    }),
  ]);
  // …return only the stocks, which now also contain the attributes of the m:n relation table.
  return [mapPortfolioFromPrisma(portfolio).stocks, count];
};

/**
 * Read all portfolios of the current user.
 * @param email The email address of the current user.
 * @returns A list of all portfolios belonging to the current user.
 */
export const readAllPortfolios = async (email: string): Promise<PortfolioSummary[]> => {
  return (
    await client.portfolio.findMany({
      select: {
        id: true,
        name: true,
        currency: true,
        stocks: { orderBy: { amount: "desc" } },
      },
      where: { user: { email } },
      orderBy: { id: "asc" },
    })
  ).map((portfolio) => ({
    ...portfolio,
    // Remove unneccessary portfolioID from every stock
    stocks: portfolio.stocks.map((stock) => ({ ticker: stock.ticker, amount: stock.amount })),
  }));
};

/**
 * Update a portfolio.
 * @param id The ID of the portfolio.
 * @param email The email of the current user.
 * @param newValues The new values for the portfolio.
 * @throws an {@link APIError} if the portfolio does not exist or belong to the user.
 */
export const updatePortfolio = async (
  id: number,
  email: string,
  newValues: Partial<Omit<Portfolio, "id" | "stocks">>,
) => {
  let k: keyof typeof newValues; // all keys of new values
  const portfolio = await readPortfolio(id, email); // Read the portfolio from the database
  let isNewData = false;
  // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
  for (k in newValues) {
    if (newValues[k] !== undefined) {
      /* c8 ignore next */ // Those properties are always caught by OpenAPI validation
      if (portfolio[k] === undefined) throw new APIError(400, `Invalid property ${k} for portfolio ${portfolio.id}.`);
      if (newValues[k] === portfolio[k]) {
        delete newValues[k];
        continue;
      }

      // New data is different from old data
      isNewData = true;
    }
  }

  if (isNewData) {
    await client.portfolio.update({
      where: { id: portfolio.id },
      data: { ...newValues },
    });
    logger.info({ prefix: "postgres", newValues }, `Updated portfolio ${id}`);
  } else {
    // No new data was provided
    logger.info({ prefix: "postgres" }, `No updates for portfolio ${id}.`);
  }
};

/**
 * Add a stock to a portfolio.
 * @param id The ID of the portfolio.
 * @param email The email of the current user.
 * @param stock The stock to add to the portfolio.
 * @throws an {@link APIError} if the portfolio does not exist or belong to the user, or if the stock does not exist or
 * is already in the portfolio.
 */
export const addStockToPortfolio = async (
  id: number,
  email: string,
  stock: Pick<WeightedStock, "ticker" | "amount">,
) => {
  const portfolio = await readPortfolio(id, email);
  // Check whether the stock exists
  await readStock(stock.ticker);
  // Check whether the stock is already in the portfolio
  if (portfolio.stocks.some((stockInPortfolio) => stock.ticker === stockInPortfolio.ticker)) {
    throw new APIError(409, `Stock ${stock.ticker} is already in portfolio ${portfolio.name}.`);
  }
  // Add the stock to the portfolio
  await client.portfolio.update({
    where: { id },
    data: { stocks: { create: { amount: stock.amount, stock: { connect: { ticker: stock.ticker } } } } },
  });
};

/**
 * Update a stock in a portfolio.
 * @param id The ID of the portfolio.
 * @param email The email of the current user.
 * @param ticker The ticker of the stock.
 * @param newValues The new values for the stock in the watchlist.
 * @throws an {@link APIError} if the portfolio does not exist or belong to the user, or if the stock is not in the
 * portfolio.
 */
export const updateStockInPortfolio = async (
  id: number,
  email: string,
  ticker: string,
  newValues: Omit<WeightedStock, keyof Stock>,
) => {
  let k: keyof typeof newValues; // all keys of new values
  const portfolio = await readPortfolio(id, email);
  // Check whether the stock exists
  await readStock(ticker);
  // Check whether the stock is in the portfolio
  if (!portfolio.stocks.some((stock) => stock.ticker === ticker)) {
    throw new APIError(404, `Stock ${ticker} is not in portfolio ${portfolio.name}.`);
  }
  const stock = portfolio.stocks.find((stock) => stock.ticker === ticker);
  let isNewData = false;
  // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
  for (k in newValues) {
    if (newValues[k] !== undefined) {
      /* c8 ignore next */ // Those properties are always caught by OpenAPI validation
      if (stock[k] === undefined) throw new APIError(400, `Invalid property ${k} for stock ${stock.ticker}.`);
      if (newValues[k] === stock[k]) {
        delete newValues[k];
        continue;
      }

      // New data is different from old data
      isNewData = true;
    }
  }

  if (isNewData) {
    await client.portfolio.update({
      where: { id },
      data: { stocks: { update: { where: { portfolioID_ticker: { portfolioID: id, ticker } }, data: newValues } } },
    });
    logger.info({ prefix: "postgres", newValues }, `Updated stock ${ticker} in portfolio ${id}`);
  } else {
    // No new data was provided
    logger.info({ prefix: "postgres" }, `No updates for stock ${ticker} in portfolio ${id}.`);
  }
};

/**
 * Remove a stock from a portfolio.
 * @param id The ID of the portfolio.
 * @param email The email of the current user.
 * @param ticker The ticker of the stock to remove.
 * @throws an {@link APIError} if the portfolio does not exist or belong to the user, or if the stock is not in the
 * portfolio.
 */
export const removeStockFromPortfolio = async (id: number, email: string, ticker: string) => {
  const portfolio = await readPortfolio(id, email);
  // Check whether the stock is in the portfolio
  if (!portfolio.stocks.some((stock) => stock.ticker === ticker)) {
    throw new APIError(404, `Stock ${ticker} is not in portfolio ${portfolio.name}.`);
  }
  // Remove the stock from the portfolio
  await client.portfolio.update({
    where: { id },
    data: { stocks: { delete: { portfolioID_ticker: { portfolioID: id, ticker } } } },
  });
};

/**
 * Delete a portfolio.
 * @param id The ID of the portfolio to delete.
 * @param email The email of the current user.
 * @throws an {@link APIError} if the portfolio does not exist or belong to the user.
 */
export const deletePortfolio = async (id: number, email: string) => {
  // Attempt to read the portfolio as the current user
  await checkPortfolioExistenceAndOwner(id, email);
  // Delete the portfolio with the given ID
  await client.portfolio.delete({ where: { id } });
  logger.info({ prefix: "postgres" }, `Deleted portfolio ${id}.`);
};
