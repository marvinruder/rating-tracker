import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { GENERAL_ACCESS, yahooFinanceEndpointSuffix } from "@rating-tracker/commons";

import { YahooStockStubSchema } from "../stock/stock.schema";
import Controller from "../utils/Controller";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator } from "../utils/middlewares";

import type ProxyService from "./proxy.service";

/**
 * This controller is responsible for relaying requests to external APIs.
 */
class ProxyController extends Controller {
  constructor(private proxyService: ProxyService) {
    super({ tags: ["Proxy API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler }).openapi(
      createRoute({
        method: "get",
        path: yahooFinanceEndpointSuffix,
        tags: this.tags,
        summary: "Access the Yahoo Finance API",
        description: "Relays a request to the Yahoo Finance API.",
        middleware: [accessRightValidator(GENERAL_ACCESS)],
        request: {
          query: z
            .object({
              q: z
                .string({
                  description:
                    "The query to be sent to the Yahoo Finance API. " +
                    "Can be a ticker, an ISIN, a name or a similar identifier of a stock.",
                })
                .min(1)
                .openapi({ examples: ["aapl", "us0378331005", "apple"] }),
            })
            .strict(),
        },
        responses: {
          200: {
            description: "OK: The response from the Yahoo Finance API.",
            content: {
              "application/json": {
                schema: z.array(YahooStockStubSchema, { description: "The Yahoo stock objects matching the query." }),
              },
            },
          },
          400: {
            description: "Bad Request: The request query is invalid.",
            content: { "application/json": { schema: ErrorSchema } },
          },
          401: {
            description: "Unauthorized: The user is not authenticated.",
            content: { "application/json": { schema: ErrorSchema } },
          },
          429: {
            description: "Too Many Requests: The Yahoo Finance API rate limit was exceeded.",
            content: { "application/json": { schema: ErrorSchema } },
          },
          502: {
            description: "Bad Gateway: The Yahoo Finance API is currently unavailable or returned an invalid response.",
            content: { "application/json": { schema: ErrorSchema } },
          },
        },
      }),
      async (c) => c.json(await this.proxyService.fetchYahooFinanceSearch(c.req.valid("query").q), 200),
    );
  }
}

export default ProxyController;
