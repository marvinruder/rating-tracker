import { z } from "zod";

/**
 * Whether to immediately respond to the request and detach the fetch process from it.
 */
export const DetachSchema = z
  .boolean({ description: "Whether to immediately respond to the request and detach the fetch process from it." })
  .openapi({ examples: [true, false] });

/**
 * Whether not to skip fetching date due to a recent successful fetch.
 */
export const NoSkipSchema = z
  .boolean({ description: "Whether not to skip fetching date due to a recent successful fetch." })
  .openapi({ examples: [true, false] });

/**
 * Whether to clear information related to the data provider before fetching.
 */
export const ClearSchema = z
  .boolean({ description: "Whether to clear information related to the data provider before fetching." })
  .openapi({ examples: [true, false] });

/**
 * How many fetcher instances to use in parallel.
 */
export const ConcurrencySchema = z
  .number({ description: "How many fetcher instances to use in parallel." })
  .int()
  .min(1)
  .max(process.env.MAX_FETCH_CONCURRENCY)
  .openapi({ examples: [1, 2, 4, 8] });
