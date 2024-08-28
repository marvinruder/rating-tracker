import { z } from "@hono/zod-openapi";
import { currencyArray } from "@rating-tracker/commons";

import { WeightedStockSchema } from "../stock/stock.schema";
import { portfolioExamples } from "../utils/examples";

/**
 * A unique identifier of a portfolio.
 */
export const IDSchema = z
  .number({ description: "A unique identifier of a portfolio." })
  .int()
  .positive()
  .openapi({ examples: portfolioExamples.map((portfolio) => portfolio.id) });

/**
 * The name of a portfolio.
 */
export const NameSchema = z
  .string({ description: "The name of a watchlist." })
  .min(1)
  .openapi({ examples: portfolioExamples.map((portfolio) => portfolio.name) });

/**
 * The 3-letter ISO 4217 currency code of the currency the portfolio’s stock amounts are expressed in.
 */
export const CurrencySchema = z
  .enum(currencyArray, {
    description: "The 3-letter ISO 4217 currency code of the currency the portfolio’s stock amounts are expressed in.",
  })
  .openapi({ examples: portfolioExamples.map((portfolio) => portfolio.currency) });

/**
 * The list of weighted stocks composing a portfolio.
 */
export const WeightedStocksSchema = z.array(WeightedStockSchema, {
  description: "The list of weighted stocks composing the portfolio.",
});

/**
 * A named collection of stocks, each associated with an amount of a specified currency.
 */
export const PortfolioSchema = z
  .object(
    { id: IDSchema, name: NameSchema, currency: CurrencySchema, stocks: WeightedStocksSchema },
    { description: "A named collection of stocks, each associated with an amount of a specified currency." },
  )
  .openapi("Portfolio");

/**
 * A named collection of stocks, each associated with an amount of a specified currency. Includes only the tickers and
 * amounts of the stocks, but not the full stock objects themselves.
 */
export const PortfolioSummarySchema = z
  .object(
    {
      id: IDSchema,
      name: NameSchema,
      currency: CurrencySchema,
      stocks: z.array(WeightedStockSchema.pick({ ticker: true, amount: true }), {
        description:
          "The list of stocks on the portfolio. Includes only the tickers of the stocks with their associated amounts.",
      }),
    },
    {
      description:
        "A named collection of stocks, each associated with an amount of a specified currency. " +
        "Includes only the tickers and amounts of the stocks, but not the full stock objects themselves.",
    },
  )
  .openapi("PortfolioSummary");
