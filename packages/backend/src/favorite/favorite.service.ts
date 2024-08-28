import type { Watchlist } from "@rating-tracker/commons";
import { FAVORITES_NAME } from "@rating-tracker/commons";

import type DBService from "../db/db.service";
import Logger from "../utils/logger";
import type WatchlistService from "../watchlist/watchlist.service";

/**
 * This service provides methods to interact with a user’s “Favorites” watchlist.
 */
class FavoriteService {
  constructor(
    dbService: DBService,
    private watchlistService: WatchlistService,
  ) {
    const { watchlist } = dbService;
    this.db = { watchlist };
  }

  /**
   * A service that provides access to the database.
   */
  private db: Pick<DBService, "watchlist">;

  /**
   * Read the Favorites watchlist of a user.
   * @param email The email of the current user.
   * @returns The Favorites watchlist.
   */
  async read(email: string): Promise<Watchlist> {
    try {
      return await this.db.watchlist.findFirstOrThrow({
        select: { id: true, name: true, subscribed: true, stocks: { orderBy: { ticker: "asc" } } },
        where: { email, name: FAVORITES_NAME },
      });
    } catch (e) {
      Logger.info({ prefix: "postgres" }, `Creating “${FAVORITES_NAME}” watchlist for user ${email}.`);
      return await this.db.watchlist.create({
        data: { name: FAVORITES_NAME, email, subscribed: true },
        select: { id: true, name: true, subscribed: true, stocks: { orderBy: { ticker: "asc" } } },
      });
    }
  }

  /**
   * Adds a stock to the Favorites watchlist of a user.
   * @param email The email of the current user.
   * @param ticker The ticker of the stock to add.
   */
  async add(email: string, ticker: string): Promise<void> {
    const { id } = await this.read(email);
    await this.watchlistService.addStock(id, email, ticker);
  }

  /**
   * Removes a stock from the Favorites watchlist of a user.
   * @param email The email of the current user.
   * @param ticker The ticker of the stock to remove.
   */
  async remove(email: string, ticker: string): Promise<void> {
    const { id } = await this.read(email);
    await this.watchlistService.removeStock(id, email, ticker);
  }
}

export default FavoriteService;
