import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { GENERAL_ACCESS } from "@rating-tracker/commons";

import { TickerSchema } from "../stock/stock.schema";
import Controller from "../utils/Controller";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator } from "../utils/middlewares";
import { WatchlistSchema } from "../watchlist/watchlist.schema";

import type FavoriteService from "./favorite.service";

/**
 * This class is responsible for handling favorites.
 */
class FavoriteController extends Controller {
  constructor(private favoriteService: FavoriteService) {
    super({ tags: ["Favorite API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler })
      .openapi(
        createRoute({
          method: "get",
          path: "",
          tags: this.tags,
          summary: "Get the Favorites watchlist",
          description: "Returns the list of favorites of the current user.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          responses: {
            200: {
              description: "OK: The list of favorites of the current user.",
              content: { "application/json": { schema: WatchlistSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => c.json(await this.favoriteService.read(c.get("user")!.email), 200),
      )
      .openapi(
        createRoute({
          method: "put",
          path: "/{ticker}",
          tags: this.tags,
          summary: "Add a stock to the Favorites watchlist",
          description: "Adds a stock to the favorites of the current user.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: { params: z.object({ ticker: TickerSchema }).strict() },
          responses: {
            201: { description: "Created: The stock was added to the user’s Favorite watchlist successfully." },
            400: {
              description: "Bad Request: The request path is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description: "Not Found: No stock with the given ticker exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.favoriteService.add(c.get("user")!.email, c.req.valid("param").ticker);
          return c.body(null, 201);
        },
      )
      .openapi(
        createRoute({
          method: "delete",
          path: "/{ticker}",
          tags: this.tags,
          summary: "Remove a stock from the Favorites watchlist",
          description: "Removes a stock from the favorites of the current user.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: { params: z.object({ ticker: TickerSchema }).strict() },
          responses: {
            204: { description: "No Content: The stock was removed from the user’s Favorite watchlist successfully." },
            400: {
              description: "Bad Request: The request path is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description: "Not Found: No stock with the given ticker exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.favoriteService.remove(c.get("user")!.email, c.req.valid("param").ticker);
          return c.body(null, 204);
        },
      );
  }
}

export default FavoriteController;
