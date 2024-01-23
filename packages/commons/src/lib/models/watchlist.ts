import type { Stock } from "./stock";

/**
 * The name of the dedicated Favorites watchlist.
 */
export const FAVORITES_NAME = "Favorites";

/**
 * A named collection of stocks of a certain interest to a user.
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
 * A named collection of stocks of a certain interest to a user. Includes only the tickers of the stocks, but not the
 * full stock objects themselves.
 */
export type WatchlistSummary = Omit<Watchlist, "stocks"> & {
  /**
   * The list of stocks on the watchlist. Includes only the tickers of the stocks
   */
  stocks: Pick<Stock, "ticker">[];
};
