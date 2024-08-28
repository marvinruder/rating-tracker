import { z } from "@hono/zod-openapi";

import { StockSchema } from "../stock/stock.schema";
import { watchlistExamples } from "../utils/examples";

/**
 * A unique identifier of a watchlist.
 */
export const IDSchema = z
  .number({ description: "A unique identifier of a watchlist." })
  .int()
  .positive()
  .openapi({ examples: watchlistExamples.map((watchlist) => watchlist.id) });

/**
 * The name of a watchlist.
 */
export const NameSchema = z
  .string({ description: "The name of a watchlist." })
  .min(1)
  .openapi({ examples: watchlistExamples.map((watchlist) => watchlist.name) });

/**
 * Whether the user subscribed to updates for a watchlist’s stocks.
 */
export const SubscribedSchema = z
  .boolean({ description: "Whether the user subscribed to updates for a watchlist’s stocks." })
  .openapi({ examples: watchlistExamples.map((watchlist) => watchlist.subscribed) });

// /**
//  * Whether the user subscribed to updates for a watchlist’s stocks. This schema coerces the input to a boolean.
//  */
// export const CoercedSubscribedSchema = z
//   .enum(["true", "false"])
//   .transform((value) => value === "true")
//   .pipe(SubscribedSchema);

/**
 * The list of stocks on a watchlist.
 */
export const StocksSchema = z.array(StockSchema, { description: "The list of stocks on a watchlist." });

/**
 * A named collection of stocks of a certain interest to a user.
 */
export const WatchlistSchema = z
  .object(
    { id: IDSchema, name: NameSchema, subscribed: SubscribedSchema, stocks: StocksSchema },
    { description: "A named collection of stocks of a certain interest to a user." },
  )
  .openapi("Watchlist");

/**
 * A named collection of stocks of a certain interest to a user. Includes only the tickers of the stocks, but not the
 * full stock objects themselves.
 */
export const WatchlistSummarySchema = z
  .object(
    {
      id: IDSchema,
      name: NameSchema,
      subscribed: SubscribedSchema,
      stocks: z.array(StockSchema.pick({ ticker: true }), {
        description: "The list of stocks on the watchlist. Includes only the tickers of the stocks.",
      }),
    },
    {
      description:
        "A named collection of stocks of a certain interest to a user. " +
        "Includes only the tickers of the stocks, but not the full stock objects themselves.",
    },
  )
  .openapi("WatchlistSummary");
