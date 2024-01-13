import { FAVORITES_NAME, Watchlist, WatchlistSummary } from "@rating-tracker/commons";

import APIError from "../../utils/APIError";
import logger from "../../utils/logger";
import client from "../client";

import { readStock } from "./stockTable";

/**
 * Check whether the given user is the owner of the specified watchlist.
 *
 * @param {number} id The ID of the watchlist.
 * @param {string} email The email of the current user.
 * @throws an {@link APIError} if the watchlist does not exist or belong to the user.
 */
const checkWatchlistExistenceAndOwner = async (id: number, email: string) => {
  const watchlist = await client.watchlist.findUnique({ where: { id } });
  if (!watchlist) {
    throw new APIError(404, `Watchlist ${id} not found.`);
  }
  if (watchlist.email !== email) {
    throw new APIError(403, `Watchlist ${id} does not belong to user with email address ${email}.`);
  }
};

/**
 * Create a watchlist.
 *
 * @param {string} name The name of the watchlist to create.
 * @param {string} email The email of the current user.
 * @throws an {@link APIError} if a reserved name is used.
 * @returns {Promise<Watchlist>} The created watchlist.
 */
export const createWatchlist = async (name: string, email: string): Promise<Watchlist> => {
  if (name === FAVORITES_NAME) {
    throw new APIError(400, `The name “${FAVORITES_NAME}” is reserved.`);
  }
  const watchlist = await client.watchlist.create({
    data: { name, email },
    select: {
      id: true,
      name: true,
      subscribed: true,
      stocks: { orderBy: { ticker: "asc" } },
    },
  });
  logger.info({ prefix: "postgres" }, `Created watchlist “${watchlist.name}” with ID ${watchlist.id}.`);
  return watchlist;
};

/**
 * Read the Favorites watchlist of a user.
 *
 * @param {string} email The email of the current user.
 * @returns {Promise<Watchlist>} The Favorites watchlist.
 */
export const readFavorites = async (email: string): Promise<Watchlist> => {
  try {
    return await client.watchlist.findFirstOrThrow({
      select: {
        id: true,
        name: true,
        subscribed: true,
        stocks: { orderBy: { ticker: "asc" } },
      },
      where: { email, name: FAVORITES_NAME },
    });
  } catch (e) {
    logger.info({ prefix: "postgres" }, `Creating “${FAVORITES_NAME}” watchlist for user ${email}.`);
    return await client.watchlist.create({
      data: { name: FAVORITES_NAME, email, subscribed: true },
      select: {
        id: true,
        name: true,
        subscribed: true,
        stocks: { orderBy: { ticker: "asc" } },
      },
    });
  }
};

/**
 * Read a watchlist.
 *
 * @param {number} id The ID of the watchlist.
 * @param {string} email The email of the current user.
 * @returns {Promise<Watchlist>} The watchlist.
 * @throws an {@link APIError} if the watchlist does not exist or belong to the user.
 */
export const readWatchlist = async (id: number, email: string): Promise<Watchlist> => {
  await checkWatchlistExistenceAndOwner(id, email);
  return await client.watchlist.findUniqueOrThrow({
    select: {
      id: true,
      name: true,
      subscribed: true,
      stocks: { orderBy: { ticker: "asc" } },
    },
    where: { id },
  });
};

/**
 * Read all watchlists of the current user.
 *
 * @param {string} email The email address of the current user.
 * @returns {Promise<WatchlistSummary[]>} A list of all watchlists belonging to the current user.
 */
export const readAllWatchlists = async (email: string): Promise<WatchlistSummary[]> => {
  return await client.watchlist.findMany({
    select: {
      id: true,
      name: true,
      subscribed: true,
      stocks: { select: { ticker: true } },
    },
    where: { user: { email } },
    orderBy: { id: "asc" },
  });
};

/**
 * Update a watchlist.
 *
 * @param {number} id The ID of the watchlist.
 * @param {string} email The email of the current user.
 * @param {Partial<Omit<Watchlist, "id" | "stocks">>} newValues The new values for the watchlist.
 * @throws an {@link APIError} if the watchlist does not exist or belong to the user, or if a reserved name is used in a
 * prohibited way.
 */
export const updateWatchlist = async (
  id: number,
  email: string,
  newValues: Partial<Omit<Watchlist, "id" | "stocks">>,
) => {
  let k: keyof typeof newValues; // all keys of new values
  const watchlist = await readWatchlist(id, email); // Read the watchlist from the database
  let isNewData = false;
  // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
  for (k in newValues) {
    if (newValues[k] !== undefined) {
      /* c8 ignore next */ // Those properties are always caught by OpenAPI validation
      if (watchlist[k] === undefined) throw new APIError(400, `Invalid property ${k} for watchlist ${watchlist.id}.`);
      if (newValues[k] === watchlist[k]) {
        delete newValues[k];
        continue;
      }
      if (k === "name") {
        if (newValues[k] === FAVORITES_NAME) {
          throw new APIError(400, `The name “${FAVORITES_NAME}” is reserved.`);
        } else if (watchlist[k] === FAVORITES_NAME) {
          throw new APIError(400, `The name “${FAVORITES_NAME}” must not be changed.`);
        }
      }

      // New data is different from old data
      isNewData = true;
    }
  }

  if (isNewData) {
    await client.watchlist.update({
      where: { id: watchlist.id },
      data: { ...newValues },
    });
    logger.info({ prefix: "postgres", newValues }, `Updated watchlist ${id}`);
  } else {
    // No new data was provided
    logger.info({ prefix: "postgres" }, `No updates for watchlist ${id}.`);
  }
};

/**
 * Adds a stock to a watchlist.
 *
 * @param {number} id The ID of the watchlist.
 * @param {string} email The email of the current user.
 * @param {string} ticker The ticker of the stock to add.
 * @throws an {@link APIError} if the watchlist or the stock does not exist.
 */
export const addStockToWatchlist = async (id: number, email: string, ticker: string) => {
  await checkWatchlistExistenceAndOwner(id, email);
  // Check whether the stock exists
  await readStock(ticker);
  await client.watchlist.update({
    where: { id },
    data: { stocks: { connect: { ticker } } },
  });
  logger.info({ prefix: "postgres" }, `Added stock ${ticker} to watchlist ${id}.`);
};

/**
 * Removes a stock from a watchlist.
 *
 * @param {number} id The ID of the watchlist.
 * @param {string} email The email of the current user.
 * @param {string} ticker The ticker of the stock to remove.
 * @throws an {@link APIError} if the watchlist or the stock do not exist.
 */
export const removeStockFromWatchlist = async (id: number, email: string, ticker: string) => {
  await checkWatchlistExistenceAndOwner(id, email);
  // Check whether the stock exists
  await readStock(ticker);
  await client.watchlist.update({
    where: { id },
    data: { stocks: { disconnect: { ticker } } },
  });
  logger.info({ prefix: "postgres" }, `Removed stock ${ticker} from watchlist ${id}.`);
};

/**
 * Delete a watchlist.
 *
 * @param {number} id The ID of the watchlist to delete.
 * @param {string} email The email of the current user.
 * @throws an {@link APIError} if the watchlist or the stock do not exist.
 */
export const deleteWatchlist = async (id: number, email: string) => {
  await checkWatchlistExistenceAndOwner(id, email);
  // Attempt to find a watchlist with the given ID
  const existingWatchlist = await client.watchlist.findUniqueOrThrow({ where: { id } });
  // If that worked, we can delete the existing watchlist
  await client.watchlist.delete({ where: { id } });
  logger.info({ prefix: "postgres" }, `Deleted watchlist “${existingWatchlist.name}” (ID ${id}).`);
};
