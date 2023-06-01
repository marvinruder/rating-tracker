import { Stock } from "./stock.js";

/**
 * A named list of stocks of a certain interest to a user.
 */
export type Watchlist = {
  /**
   * A unique identifier of the watchlist.
   */
  id: number;
  /**
   * The name of the watchlist.
   */
  name: string;
  /**
   * Whether the user subscribed to updates for the watchlist’s stocks.
   */
  subscribed: boolean;
  /**
   * The list of stocks on the watchlist.
   */
  stocks: Stock[];
};

/**
 * A named list of stocks of a certain interest to a user. Includes only the number of stocks, but not the stock objects
 * themselves.
 */
export type WatchlistSummary = {
  /**
   * A unique identifier of the watchlist.
   */
  id: number;
  /**
   * The name of the watchlist.
   */
  name: string;
  /**
   * Whether the user subscribed to updates for the watchlist’s stocks.
   */
  subscribed: boolean;
  /**
   * The number of certain objects within the watchlist.
   */
  _count: {
    /**
     * The number of stocks within the watchlist.
     */
    stocks: number;
  };
};
