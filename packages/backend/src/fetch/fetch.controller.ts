import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  fetchLSEGEndpointSuffix,
  fetchMarketScreenerEndpointSuffix,
  fetchMorningstarEndpointSuffix,
  fetchMSCIEndpointSuffix,
  fetchSPEndpointSuffix,
  fetchSustainalyticsEndpointSuffix,
  fetchYahooEndpointSuffix,
  GENERAL_ACCESS,
  WRITE_STOCKS_ACCESS,
} from "@rating-tracker/commons";

import { StockSchema, TickerSchema } from "../stock/stock.schema";
import Controller from "../utils/Controller";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator } from "../utils/middlewares";

import { ClearSchema, ConcurrencySchema, DetachSchema, NoSkipSchema } from "./fetch.schema";
import type FetchService from "./fetch.service";

/**
 * This class is responsible for fetching data from external data providers.
 */
class FetchController extends Controller {
  constructor(private fetchService: FetchService) {
    super({ tags: ["Fetch API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler })
      .openapi(
        createRoute({
          method: "post",
          path: fetchYahooEndpointSuffix,
          tags: this.tags,
          summary: "Fetch data from Yahoo Finance",
          description: "Fetches information from Yahoo Finance API.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)],
          request: {
            query: z
              .object({
                ticker: TickerSchema.describe(
                  "The ticker of a stock for which information is to be fetched. " +
                    "If not present, all stocks known to the system will be used",
                ),
              })
              .partial()
              .strict(),
            body: {
              description: "Parameters describing the fetch procedure.",
              required: false,
              content: {
                "application/json": {
                  schema: z
                    .object({
                      detach: DetachSchema,
                      noSkip: NoSkipSchema,
                      clear: ClearSchema,
                      concurrency: ConcurrencySchema,
                    })
                    .partial()
                    .strict(),
                },
              },
            },
          },
          responses: {
            200: {
              description: "OK: The list of successfully fetched stocks.",
              content: { "application/json": { schema: z.array(StockSchema) } },
            },
            202: {
              description: "Accepted: The request has been accepted for detached processing.",
            },
            400: {
              description: "Bad Request: The request query or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No stock with the given ticker exists, " +
                "or the stock does not have an appropriate identifier to be used with the data provider.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            500: {
              description: "Internal Server Error: All fetcher instances exited with stocks still queued.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            502: {
              description: "Bad Gateway: The data provider returned an invalid response.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { detach, ...options } = { ...c.req.valid("query"), ...c.req.valid("json") };
          const fetchedStocksPromise = this.fetchService.fetchFromDataProvider("yahoo", options);

          // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
          if (detach) return c.body(null, 202);
          return c.json(await fetchedStocksPromise, 200);
        },
      )
      .openapi(
        createRoute({
          method: "post",
          path: fetchMorningstarEndpointSuffix,
          tags: this.tags,
          summary: "Fetch data from Morningstar",
          description: "Fetches information from Morningstar Italy web page.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)],
          request: {
            query: z
              .object({
                ticker: TickerSchema.describe(
                  "The ticker of a stock for which information is to be fetched. " +
                    "If not present, all stocks known to the system will be used",
                ),
              })
              .partial()
              .strict(),
            body: {
              description: "Parameters describing the fetch procedure.",
              required: false,
              content: {
                "application/json": {
                  schema: z
                    .object({
                      detach: DetachSchema,
                      noSkip: NoSkipSchema,
                      clear: ClearSchema,
                      concurrency: ConcurrencySchema,
                    })
                    .partial()
                    .strict(),
                },
              },
            },
          },
          responses: {
            200: {
              description: "OK: The list of successfully fetched stocks.",
              content: { "application/json": { schema: z.array(StockSchema) } },
            },
            202: {
              description: "Accepted: The request has been accepted for detached processing.",
            },
            400: {
              description: "Bad Request: The request query or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No stock with the given ticker exists, " +
                "or the stock does not have an appropriate identifier to be used with the data provider.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            500: {
              description: "Internal Server Error: All fetcher instances exited with stocks still queued.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            502: {
              description: "Bad Gateway: The data provider returned an invalid response.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { detach, ...options } = { ...c.req.valid("query"), ...c.req.valid("json") };
          const fetchedStocksPromise = this.fetchService.fetchFromDataProvider("morningstar", options);

          // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
          if (detach) return c.body(null, 202);
          return c.json(await fetchedStocksPromise, 200);
        },
      )
      .openapi(
        createRoute({
          method: "post",
          path: fetchMarketScreenerEndpointSuffix,
          tags: this.tags,
          summary: "Fetch data from MarketScreener",
          description: "Fetches information from Market Screener web page and API.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)],
          request: {
            query: z
              .object({
                ticker: TickerSchema.describe(
                  "The ticker of a stock for which information is to be fetched. " +
                    "If not present, all stocks known to the system will be used",
                ),
              })
              .partial()
              .strict(),
            body: {
              description: "Parameters describing the fetch procedure.",
              required: false,
              content: {
                "application/json": {
                  schema: z
                    .object({
                      detach: DetachSchema,
                      noSkip: NoSkipSchema,
                      clear: ClearSchema,
                      concurrency: ConcurrencySchema,
                    })
                    .partial()
                    .strict(),
                },
              },
            },
          },
          responses: {
            200: {
              description: "OK: The list of successfully fetched stocks.",
              content: { "application/json": { schema: z.array(StockSchema) } },
            },
            202: {
              description: "Accepted: The request has been accepted for detached processing.",
            },
            400: {
              description: "Bad Request: The request query or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No stock with the given ticker exists, " +
                "or the stock does not have an appropriate identifier to be used with the data provider.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            500: {
              description: "Internal Server Error: All fetcher instances exited with stocks still queued.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            502: {
              description: "Bad Gateway: The data provider returned an invalid response.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { detach, ...options } = { ...c.req.valid("query"), ...c.req.valid("json") };
          const fetchedStocksPromise = this.fetchService.fetchFromDataProvider("marketScreener", options);

          // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
          if (detach) return c.body(null, 202);
          return c.json(await fetchedStocksPromise, 200);
        },
      )
      .openapi(
        createRoute({
          method: "post",
          path: fetchMSCIEndpointSuffix,
          tags: this.tags,
          summary: "Fetch data from MSCI",
          description: "Fetches information from MSCI ESG Ratings & Climate Search Tool web page.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)],
          request: {
            query: z
              .object({
                ticker: TickerSchema.describe(
                  "The ticker of a stock for which information is to be fetched. " +
                    "If not present, all stocks known to the system will be used",
                ),
              })
              .partial()
              .strict(),
            body: {
              description: "Parameters describing the fetch procedure.",
              required: false,
              content: {
                "application/json": {
                  schema: z
                    .object({
                      detach: DetachSchema,
                      noSkip: NoSkipSchema,
                      clear: ClearSchema,
                      concurrency: ConcurrencySchema,
                    })
                    .partial()
                    .strict(),
                },
              },
            },
          },
          responses: {
            200: {
              description: "OK: The list of successfully fetched stocks.",
              content: { "application/json": { schema: z.array(StockSchema) } },
            },
            202: {
              description: "Accepted: The request has been accepted for detached processing.",
            },
            400: {
              description: "Bad Request: The request query or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No stock with the given ticker exists, " +
                "or the stock does not have an appropriate identifier to be used with the data provider.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            500: {
              description: "Internal Server Error: All fetcher instances exited with stocks still queued.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            502: {
              description: "Bad Gateway: The data provider returned an invalid response.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { detach, ...options } = { ...c.req.valid("query"), ...c.req.valid("json") };
          const fetchedStocksPromise = this.fetchService.fetchFromDataProvider("msci", options);

          // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
          if (detach) return c.body(null, 202);
          return c.json(await fetchedStocksPromise, 200);
        },
      )
      .openapi(
        createRoute({
          method: "post",
          path: fetchLSEGEndpointSuffix,
          tags: this.tags,
          summary: "Fetch data from LSEG",
          description: "Fetches information from LSEG Data & Analytics API.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)],
          request: {
            query: z
              .object({
                ticker: TickerSchema.describe(
                  "The ticker of a stock for which information is to be fetched. " +
                    "If not present, all stocks known to the system will be used",
                ),
              })
              .partial()
              .strict(),
            body: {
              description: "Parameters describing the fetch procedure.",
              required: false,
              content: {
                "application/json": {
                  schema: z
                    .object({
                      detach: DetachSchema,
                      noSkip: NoSkipSchema,
                      clear: ClearSchema,
                      concurrency: ConcurrencySchema,
                    })
                    .partial()
                    .strict(),
                },
              },
            },
          },
          responses: {
            200: {
              description: "OK: The list of successfully fetched stocks.",
              content: { "application/json": { schema: z.array(StockSchema) } },
            },
            202: {
              description: "Accepted: The request has been accepted for detached processing.",
            },
            400: {
              description: "Bad Request: The request query or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No stock with the given ticker exists, " +
                "or the stock does not have an appropriate identifier to be used with the data provider.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            500: {
              description: "Internal Server Error: All fetcher instances exited with stocks still queued.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            502: {
              description: "Bad Gateway: The data provider returned an invalid response.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { detach, ...options } = { ...c.req.valid("query"), ...c.req.valid("json") };
          const fetchedStocksPromise = this.fetchService.fetchFromDataProvider("lseg", options);

          // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
          if (detach) return c.body(null, 202);
          return c.json(await fetchedStocksPromise, 200);
        },
      )
      .openapi(
        createRoute({
          method: "post",
          path: fetchSPEndpointSuffix,
          tags: this.tags,
          summary: "Fetch data from S&P",
          description: "Fetches information from Standard & Poor’s Global Sustainable1 ESG Scores web page.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)],
          request: {
            query: z
              .object({
                ticker: TickerSchema.describe(
                  "The ticker of a stock for which information is to be fetched. " +
                    "If not present, all stocks known to the system will be used",
                ),
              })
              .partial()
              .strict(),
            body: {
              description: "Parameters describing the fetch procedure.",
              required: false,
              content: {
                "application/json": {
                  schema: z
                    .object({
                      detach: DetachSchema,
                      noSkip: NoSkipSchema,
                      clear: ClearSchema,
                      concurrency: ConcurrencySchema,
                    })
                    .partial()
                    .strict(),
                },
              },
            },
          },
          responses: {
            200: {
              description: "OK: The list of successfully fetched stocks.",
              content: { "application/json": { schema: z.array(StockSchema) } },
            },
            202: {
              description: "Accepted: The request has been accepted for detached processing.",
            },
            400: {
              description: "Bad Request: The request query or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No stock with the given ticker exists, " +
                "or the stock does not have an appropriate identifier to be used with the data provider.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            500: {
              description: "Internal Server Error: All fetcher instances exited with stocks still queued.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            502: {
              description: "Bad Gateway: The data provider returned an invalid response.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { detach, ...options } = { ...c.req.valid("query"), ...c.req.valid("json") };
          const fetchedStocksPromise = this.fetchService.fetchFromDataProvider("sp", options);

          // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
          if (detach) return c.body(null, 202);
          return c.json(await fetchedStocksPromise, 200);
        },
      )
      .openapi(
        createRoute({
          method: "post",
          path: fetchSustainalyticsEndpointSuffix,
          tags: this.tags,
          summary: "Fetch data from Sustainalytics",
          description: "Fetches information from Morningstar Sustainalytics API.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)],
          request: {
            query: z
              .object({
                ticker: TickerSchema.describe(
                  "The ticker of a stock for which information is to be fetched. " +
                    "If not present, all stocks known to the system will be used",
                ),
              })
              .partial()
              .strict(),
            body: {
              description: "Parameters describing the fetch procedure.",
              required: false,
              content: {
                "application/json": {
                  schema: z.object({ detach: DetachSchema, clear: ClearSchema }).partial().strict(),
                },
              },
            },
          },
          responses: {
            200: {
              description: "OK: The list of successfully fetched stocks.",
              content: { "application/json": { schema: z.array(StockSchema) } },
            },
            202: {
              description: "Accepted: The request has been accepted for detached processing.",
            },
            400: {
              description: "Bad Request: The request query or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No stock with the given ticker exists, " +
                "or the stock does not have an appropriate identifier to be used with the data provider.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            502: {
              description: "Bad Gateway: The data provider returned an invalid response.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { detach, ...options } = { ...c.req.valid("query"), ...c.req.valid("json") };
          const fetchedStocksPromise = this.fetchService.fetchFromDataProvider("sustainalytics", options);

          // If the request is to be detached, we send a 202 Accepted response now and continue processing the request.
          if (detach) return c.body(null, 202);
          return c.json(await fetchedStocksPromise, 200);
        },
      );
  }
}

export default FetchController;
