import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { FAVORITES_NAME, GENERAL_ACCESS, stocksAPIPath } from "@rating-tracker/commons";

import { TickerSchema } from "../stock/stock.schema";
import Controller from "../utils/Controller";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator } from "../utils/middlewares";
import ValidationHelper from "../utils/validationHelper";

import { IDSchema, NameSchema, SubscribedSchema, WatchlistSchema, WatchlistSummarySchema } from "./watchlist.schema";
import type WatchlistService from "./watchlist.service";

/**
 * This controller is responsible for handling watchlist information.
 */
class WatchlistController extends Controller {
  constructor(private watchlistService: WatchlistService) {
    super({ tags: ["Watchlist API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler })
      .openapi(
        createRoute({
          method: "get",
          path: "",
          tags: this.tags,
          summary: "Get a summary of all watchlists",
          description: "Returns a summary of the watchlists of the current user.",
          middleware: [accessRightValidator(GENERAL_ACCESS)],
          responses: {
            200: {
              description: "OK: A summary of all watchlists.",
              content: { "application/json": { schema: z.array(WatchlistSummarySchema) } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) =>
          c.json(
            (await this.watchlistService.readAll(c.get("user")!.email)).sort((a, b) =>
              // Sort the Favorites watchlist to the top
              a.name === FAVORITES_NAME ? -1 : b.name === FAVORITES_NAME ? 1 : 0,
            ),
            200,
          ),
      )
      .openapi(
        createRoute({
          method: "get",
          path: "/{id}",
          tags: this.tags,
          summary: "Get a watchlist",
          description: "Reads a single watchlist from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)],
          request: { params: z.object({ id: ValidationHelper.coerceToInteger(IDSchema) }).strict() },
          responses: {
            200: {
              description: "OK: The requested watchlist.",
              content: { "application/json": { schema: WatchlistSchema } },
            },
            400: {
              description: "Bad Request: The request path is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The requested watchlist does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description: "Not Found: No watchlist with the given ID exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => c.json(await this.watchlistService.read(c.req.valid("param").id, c.get("user")!.email), 200),
      )
      .openapi(
        createRoute({
          method: "put",
          path: "",
          tags: this.tags,
          summary: "Create a new watchlist",
          description: "Creates a new watchlist in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)],
          request: {
            body: {
              description: "Properties of the watchlist to be created.",
              required: true,
              content: { "application/json": { schema: z.object({ name: NameSchema }).strict() } },
            },
          },
          responses: {
            201: {
              description: "Created: The new watchlist.",
              content: { "application/json": { schema: WatchlistSchema } },
            },
            400: {
              description:
                "Bad Request: The request body is invalid, " + `or the reserved “${FAVORITES_NAME}” name was used.`,
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => c.json(await this.watchlistService.create(c.req.valid("json").name, c.get("user")!.email), 201),
      )
      .openapi(
        createRoute({
          method: "patch",
          path: "/{id}",
          tags: this.tags,
          summary: "Update a watchlist",
          description: "Updates a watchlist in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)],
          request: {
            params: z.object({ id: ValidationHelper.coerceToInteger(IDSchema) }).strict(),
            body: {
              description: "Properties to update in the watchlist.",
              required: true,
              content: {
                "application/json": {
                  schema: z.object({ name: NameSchema, subscribed: SubscribedSchema }).partial().strict(),
                },
              },
            },
          },
          responses: {
            204: { description: "No Content: The watchlist was updated successfully." },
            400: {
              description:
                "Bad Request: The request path or body is invalid, " +
                `or the reserved “${FAVORITES_NAME}” name was used.`,
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The referenced watchlist does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description: "Not Found: No watchlist with the given ID exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.watchlistService.update(c.req.valid("param").id, c.get("user")!.email, c.req.valid("json"));
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "put",
          path: `/{id}${stocksAPIPath}/{ticker}`,
          tags: this.tags,
          summary: "Add a stock to a watchlist",
          description: "Adds a stock to a watchlist in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)],
          request: {
            params: z.object({ id: ValidationHelper.coerceToInteger(IDSchema), ticker: TickerSchema }).strict(),
          },
          responses: {
            204: { description: "No Content: The stock was added successfully." },
            400: {
              description: "Bad Request: The request path is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The referenced watchlist does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No watchlist with the given ID exists, or no stock with the given ticker exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.watchlistService.addStock(
            c.req.valid("param").id,
            c.get("user")!.email,
            c.req.valid("param").ticker,
          );
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "delete",
          path: `/{id}${stocksAPIPath}/{ticker}`,
          tags: this.tags,
          summary: "Remove a stock from a watchlist",
          description: "Removes a stock from a watchlist in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)],
          request: {
            params: z.object({ id: ValidationHelper.coerceToInteger(IDSchema), ticker: TickerSchema }).strict(),
          },
          responses: {
            204: { description: "No Content: The stock was removed successfully." },
            400: {
              description: "Bad Request: The request path is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The referenced watchlist does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No watchlist with the given ID exists, or no stock with the given ticker exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.watchlistService.removeStock(
            c.req.valid("param").id,
            c.get("user")!.email,
            c.req.valid("param").ticker,
          );
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "delete",
          path: "/{id}",
          tags: this.tags,
          summary: "Delete a watchlist",
          description: "Deletes a watchlist from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)],
          request: { params: z.object({ id: ValidationHelper.coerceToInteger(IDSchema) }).strict() },
          responses: {
            204: { description: "No Content: The watchlist was deleted successfully." },
            400: {
              description: "Bad Request: The request path is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The referenced watchlist does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.watchlistService.delete(c.req.valid("param").id, c.get("user")!.email);
          return c.body(null, 204);
        },
      );
  }
}

export default WatchlistController;
