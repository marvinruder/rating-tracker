import type { Watchlist, WatchlistSummary } from "@rating-tracker/commons";
import { FAVORITES_NAME } from "@rating-tracker/commons";

import type DBService from "../db/db.service";
import BadGatewayError from "../utils/error/api/BadGatewayError";
import BadRequestError from "../utils/error/api/BadRequestError";
import ForbiddenError from "../utils/error/api/ForbiddenError";
import NotFoundError from "../utils/error/api/NotFoundError";
import Logger from "../utils/logger";

/**
 * This service provides methods to interact with a user’s watchlists.
 */
class WatchlistService {
  constructor(dbService: DBService) {
    const { stock, watchlist } = dbService;
    this.db = { stock, watchlist };
  }

  /**
   * A service that provides access to the database.
   */
  private db: Pick<DBService, "stock" | "watchlist">;

  /**
   * Check whether the given user is the owner of the specified watchlist.
   * @param id The ID of the watchlist.
   * @param email The email of the current user.
   * @throws an {@link APIError} if the watchlist does not exist or belong to the user.
   */
  async #checkExistenceAndOwner(id: number, email: string) {
    const watchlist = await this.db.watchlist.findUnique({ where: { id } });
    if (!watchlist) {
      throw new NotFoundError(`Watchlist ${id} not found.`);
    }
    if (watchlist.email !== email) {
      throw new ForbiddenError(`Watchlist ${id} does not belong to user with email address ${email}.`);
    }
  }

  /**
   * Check whether a stock with the given ticker exists.
   * @param ticker The ticker of the stock.
   * @throws an {@link APIError} if the stock does not exist.
   */
  async #checkStockExistence(ticker: string) {
    try {
      await this.db.stock.findUniqueOrThrow({ where: { ticker } });
    } catch (error) {
      throw new NotFoundError(`Stock ${ticker} not found.`);
    }
  }

  /**
   * Create a watchlist.
   * @param name The name of the watchlist to create.
   * @param email The email of the current user.
   * @throws an {@link APIError} if a reserved name is used.
   * @returns The created watchlist.
   */
  async create(name: string, email: string): Promise<Watchlist> {
    if (name === FAVORITES_NAME) {
      throw new BadRequestError(`The name “${FAVORITES_NAME}” is reserved.`);
    }
    const watchlist = await this.db.watchlist.create({
      data: { name, email },
      select: { id: true, name: true, subscribed: true, stocks: { orderBy: { ticker: "asc" } } },
    });
    Logger.info({ prefix: "postgres" }, `Created watchlist “${watchlist.name}” with ID ${watchlist.id}.`);
    return watchlist;
  }

  /**
   * Read a watchlist.
   * @param id The ID of the watchlist.
   * @param email The email of the current user.
   * @returns The watchlist.
   * @throws an {@link APIError} if the watchlist does not exist or belong to the user.
   */
  async read(id: number, email: string): Promise<Watchlist> {
    await this.#checkExistenceAndOwner(id, email);
    return await this.db.watchlist.findUniqueOrThrow({
      select: { id: true, name: true, subscribed: true, stocks: { orderBy: { ticker: "asc" } } },
      where: { id },
    });
  }

  /**
   * Read all watchlists of the current user.
   * @param email The email address of the current user.
   * @returns A list of all watchlists belonging to the current user.
   */
  async readAll(email: string): Promise<WatchlistSummary[]> {
    return await this.db.watchlist.findMany({
      select: { id: true, name: true, subscribed: true, stocks: { select: { ticker: true } } },
      where: { user: { email } },
      orderBy: { id: "asc" },
    });
  }

  /**
   * Update a watchlist.
   * @param id The ID of the watchlist.
   * @param email The email of the current user.
   * @param newValues The new values for the watchlist.
   * @throws an {@link APIError} if the watchlist does not exist or belong to the user, or if a reserved name is used in
   * a prohibited way.
   */
  async update(id: number, email: string, newValues: Partial<Omit<Watchlist, "id" | "stocks">>) {
    let k: keyof typeof newValues; // all keys of new values
    const watchlist = await this.read(id, email); // Read the watchlist from the database
    let isNewData = false;
    // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
    for (k in newValues) {
      if (newValues[k] !== undefined) {
        /* c8 ignore next */ // Those properties are always caught by OpenAPI validation
        if (watchlist[k] === undefined)
          throw new BadGatewayError(`Invalid property ${k} for watchlist ${watchlist.id}.`);
        if (newValues[k] === watchlist[k]) {
          delete newValues[k];
          continue;
        }
        if (k === "name") {
          if (newValues[k] === FAVORITES_NAME) {
            throw new BadRequestError(`The name “${FAVORITES_NAME}” is reserved.`);
          } else if (watchlist[k] === FAVORITES_NAME) {
            throw new BadRequestError(`The name “${FAVORITES_NAME}” must not be changed.`);
          }
        }

        // New data is different from old data
        isNewData = true;
      }
    }

    if (isNewData) {
      await this.db.watchlist.update({ where: { id: watchlist.id }, data: { ...newValues } });
      Logger.info({ prefix: "postgres", newValues }, `Updated watchlist ${id}`);
    } else {
      // No new data was provided
      Logger.info({ prefix: "postgres" }, `No updates for watchlist ${id}.`);
    }
  }

  /**
   * Adds a stock to a watchlist.
   * @param id The ID of the watchlist.
   * @param email The email of the current user.
   * @param ticker The ticker of the stock to add.
   * @throws an {@link APIError} if the watchlist or the stock does not exist.
   */
  async addStock(id: number, email: string, ticker: string) {
    const watchlist = await this.read(id, email);
    // Check whether the stock exists
    await this.#checkStockExistence(ticker);
    // Check whether the stock is already on the watchlist
    if (watchlist.stocks.some((stockInWatchlist) => ticker === stockInWatchlist.ticker)) {
      Logger.warn({ prefix: "postgres" }, `Stock ${ticker} is already on watchlist ${id}.`);
      return;
    }
    // Add the stock to the watchlist
    await this.db.watchlist.update({ where: { id }, data: { stocks: { connect: { ticker } } } });
    Logger.info({ prefix: "postgres" }, `Added stock ${ticker} to portfolio ${id}.`);
  }

  /**
   * Removes a stock from a watchlist.
   * @param id The ID of the watchlist.
   * @param email The email of the current user.
   * @param ticker The ticker of the stock to remove.
   * @throws an {@link APIError} if the watchlist or the stock do not exist.
   */
  async removeStock(id: number, email: string, ticker: string) {
    const watchlist = await this.read(id, email);
    // Check whether the stock exists
    await this.#checkStockExistence(ticker);
    // Check whether the stock is on the watchlist
    if (!watchlist.stocks.some((stockInWatchlist) => ticker === stockInWatchlist.ticker)) {
      Logger.warn({ prefix: "postgres" }, `Stock ${ticker} is not on watchlist ${id}.`);
      return;
    }
    // Remove the stock from the watchlist
    await this.db.watchlist.update({ where: { id }, data: { stocks: { disconnect: { ticker } } } });
    Logger.info({ prefix: "postgres" }, `Removed stock ${ticker} from watchlist ${id}.`);
  }

  /**
   * Delete a watchlist.
   * @param id The ID of the watchlist to delete.
   * @param email The email of the current user.
   * @throws an {@link APIError} if the watchlist or the stock do not exist.
   */
  async delete(id: number, email: string) {
    // Attempt to read the watchlist as the current user
    try {
      await this.#checkExistenceAndOwner(id, email);
    } catch (e) {
      if (e instanceof NotFoundError) {
        // The watchlist does not exist at all
        Logger.warn({ prefix: "postgres" }, `Watchlist ${id} does not exist.`);
        return;
      }
      // The watchlist exists, but does not belong to the user
      throw e;
    }
    // Delete the watchlist with the given ID
    await this.db.watchlist.delete({ where: { id } });
    Logger.info({ prefix: "postgres" }, `Deleted watchlist ${id}.`);
  }
}

export default WatchlistService;