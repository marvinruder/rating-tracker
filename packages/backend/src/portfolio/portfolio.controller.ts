import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { GENERAL_ACCESS, stocksAPIPath } from "@rating-tracker/commons";

import { AmountSchema, TickerSchema } from "../stock/stock.schema";
import Controller from "../utils/Controller";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator } from "../utils/middlewares";
import ValidationHelper from "../utils/validationHelper";

import { CurrencySchema, IDSchema, NameSchema, PortfolioSchema, PortfolioSummarySchema } from "./portfolio.schema";
import type PortfolioService from "./portfolio.service";

/**
 * This controller is responsible for handling portfolio information.
 */
class PortfolioController extends Controller {
  constructor(private portfolioService: PortfolioService) {
    super({ tags: ["Portfolio API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler })
      .openapi(
        createRoute({
          method: "get",
          path: "",
          tags: this.tags,
          summary: "Get a summary of all portfolios",
          description: "Returns a summary of the portfolios of the current user.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          responses: {
            200: {
              description: "OK: A summary of all portfolios.",
              content: { "application/json": { schema: z.array(PortfolioSummarySchema) } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => c.json(await this.portfolioService.readAll(c.get("user")!.email), 200),
      )
      .openapi(
        createRoute({
          method: "get",
          path: "/{id}",
          tags: this.tags,
          summary: "Get a portfolio",
          description: "Reads a single portfolio from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: { params: z.object({ id: ValidationHelper.coerceToInteger(IDSchema) }).strict() },
          responses: {
            200: {
              description: "OK: The requested portfolio.",
              content: { "application/json": { schema: PortfolioSchema } },
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
              description: "Forbidden: The requested portfolio does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description: "Not Found: No portfolio with the given ID exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => c.json(await this.portfolioService.read(c.req.valid("param").id, c.get("user")!.email), 200),
      )
      .openapi(
        createRoute({
          method: "put",
          path: "",
          tags: this.tags,
          summary: "Create a new portfolio",
          description: "Creates a new portfolio in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: {
            body: {
              description: "Properties of the portfolio to be created.",
              required: true,
              content: {
                "application/json": { schema: z.object({ name: NameSchema, currency: CurrencySchema }).strict() },
              },
            },
          },
          responses: {
            201: {
              description: "Created: The new portfolio.",
              content: { "application/json": { schema: PortfolioSchema } },
            },
            400: {
              description: "Bad Request: The request body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) =>
          c.json(
            await this.portfolioService.create(
              c.req.valid("json").name,
              c.get("user")!.email,
              c.req.valid("json").currency,
            ),
            201,
          ),
      )
      .openapi(
        createRoute({
          method: "patch",
          path: "/{id}",
          tags: this.tags,
          summary: "Update a portfolio",
          description: "Updates a portfolio in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: {
            params: z.object({ id: ValidationHelper.coerceToInteger(IDSchema) }).strict(),
            body: {
              description: "Properties to update in the portfolio.",
              required: true,
              content: {
                "application/json": {
                  schema: z.object({ name: NameSchema, currency: CurrencySchema }).partial().strict(),
                },
              },
            },
          },
          responses: {
            204: { description: "No Content: The portfolio was updated successfully." },
            400: {
              description: "Bad Request: The request path or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The referenced portfolio does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description: "Not Found: No portfolio with the given ID exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.portfolioService.update(c.req.valid("param").id, c.get("user")!.email, c.req.valid("json"));
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "put",
          path: `/{id}${stocksAPIPath}/{ticker}`,
          tags: this.tags,
          summary: "Add a stock to a portfolio",
          description: "Adds a stock to a portfolio in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: {
            params: z.object({ id: ValidationHelper.coerceToInteger(IDSchema), ticker: TickerSchema }).strict(),
            body: {
              description: "Properties of the added stock within the portfolio.",
              required: true,
              content: { "application/json": { schema: z.object({ amount: AmountSchema }).strict() } },
            },
          },
          responses: {
            204: { description: "No Content: The stock was added successfully." },
            400: {
              description: "Bad Request: The request path or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The referenced portfolio does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No portfolio with the given ID exists, or no stock with the given ticker exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            409: {
              description: "Conflict: The stock is already in the portfolio.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.portfolioService.addStock(c.req.valid("param").id, c.get("user")!.email, {
            ticker: c.req.valid("param").ticker,
            amount: c.req.valid("json").amount,
          });
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "patch",
          path: `/{id}${stocksAPIPath}/{ticker}`,
          tags: this.tags,
          summary: "Update a stock in a portfolio",
          description: "Updates a stock in a portfolio in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: {
            params: z.object({ id: ValidationHelper.coerceToInteger(IDSchema), ticker: TickerSchema }).strict(),
            body: {
              description: "Properties to be updated in the stock within the portfolio.",
              required: true,
              content: { "application/json": { schema: z.object({ amount: AmountSchema }).partial().strict() } },
            },
          },
          responses: {
            204: { description: "No Content: The stock was updated successfully." },
            400: {
              description: "Bad Request: The request path or body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The referenced portfolio does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No portfolio with the given ID exists, " +
                "or no stock with the given ticker exists in the portfolio.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.portfolioService.updateStock(
            c.req.valid("param").id,
            c.get("user")!.email,
            c.req.valid("param").ticker,
            { amount: c.req.valid("json").amount },
          );
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "delete",
          path: `/{id}${stocksAPIPath}/{ticker}`,
          tags: this.tags,
          summary: "Remove a stock from a portfolio",
          description: "Removes a stock from a portfolio in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
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
              description: "Forbidden: The referenced portfolio does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description:
                "Not Found: No portfolio with the given ID exists, or no stock with the given ticker exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.portfolioService.removeStock(
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
          summary: "Delete a portfolio",
          description: "Deletes a portfolio from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: { params: z.object({ id: ValidationHelper.coerceToInteger(IDSchema) }).strict() },
          responses: {
            204: { description: "No Content: The portfolio was deleted successfully." },
            400: {
              description: "Bad Request: The request path is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The referenced portfolio does not belong to the user.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.portfolioService.delete(c.req.valid("param").id, c.get("user")!.email);
          return c.body(null, 204);
        },
      );
  }
}

export default PortfolioController;
