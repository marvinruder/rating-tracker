import { Currency } from "../Currency";

import { Stock } from "./stock";

/**
 * A stock associated with an amount of a specified currency.
 */
export type WeightedStock = Stock & {
  /**
   * The amount of currency associated with the stock.
   */
  amount: number;
};

/**
 * A named collection of stocks, each associated with an amount of a specified currency.
 */
export type Portfolio = {
  /**
   * A unique identifier of the portfolio.
   */
  id: number;
  /**
   * The name of the portfolio.
   */
  name: string;
  /**
   * The currency associated with the portfolio.
   */
  currency: Currency;
  /**
   * The list of weighted stocks composing the portfolio.
   */
  stocks: WeightedStock[];
};

/**
 * A named collection of stocks, each associated with an amount of a specified currency. Includes only the tickers and
 * amounts of the stocks, but not the full stock objects themselves.
 */
export type PortfolioSummary = Omit<Portfolio, "stocks"> & {
  /**
   * The list of stocks on the portfolio. Includes only the tickers of the stocks with their associated amounts.
   */
  stocks: Pick<WeightedStock, "ticker" | "amount">[];
};
