import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { GENERAL_ACCESS, stockLogoEndpointSuffix, WRITE_STOCKS_ACCESS } from "@rating-tracker/commons";
import type { TypedResponse } from "hono";

import { IDSchema as PortfolioIDSchema } from "../portfolio/portfolio.schema";
import Controller from "../utils/Controller";
import ConflictError from "../utils/error/api/ConflictError";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator } from "../utils/middlewares";
import ValidationHelper from "../utils/validationHelper";
import { IDSchema as WatchlistIDSchema } from "../watchlist/watchlist.schema";

import {
  AnalystConsensusSchema,
  AnalystCountSchema,
  AnalystTargetPricePercentageToLastCloseSchema,
  CountrySchema,
  DividendYieldPercentSchema,
  ESGScoreSchema,
  FinancialScoreSchema,
  IndustrySchema,
  ISINSchema,
  LogoSchema,
  LogoVariantSchema,
  LSEGEmissionsSchema,
  LSEGESGScoreSchema,
  MarketScreenerIDSchema,
  MorningstarFairValuePercentageToLastCloseSchema,
  MorningstarIDSchema,
  MSCIESGRatingSchema,
  MSCIIDSchema,
  MSCITemperatureSchema,
  NameSchema,
  PriceEarningRatioSchema,
  RICSchema,
  SizeSchema,
  SortableAttributeSchema,
  SPESGScoreSchema,
  SPIDSchema,
  StarRatingSchema,
  StockListWithCountSchema,
  StockSchema,
  StyleSchema,
  SustainalyticsESGRiskSchema,
  SustainalyticsIDSchema,
  TickerSchema,
  TotalScoreSchema,
} from "./stock.schema";
import type StockService from "./stock.service";

/**
 * This controller is responsible for handling stock data.
 */
class StockController extends Controller {
  constructor(private stockService: StockService) {
    super({ tags: ["Stock API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler })
      .openapi(
        createRoute({
          method: "get",
          path: "",
          tags: this.tags,
          summary: "Get a list of stocks",
          description: "Returns a list of stocks, which can be filtered, sorted and paginated.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: {
            query: z
              .object({
                offset: ValidationHelper.coerceToInteger(
                  z
                    .number({ description: "The zero-based offset of a list. Used for pagination." })
                    .int()
                    .min(0)
                    .openapi({ examples: [0, 25, 50, 300] }),
                ),
                count: ValidationHelper.coerceToInteger(
                  z
                    .number({
                      description:
                        "The number of stocks to be returned. " +
                        "If omitted, all stocks known to the service will be returned.",
                    })
                    .int()
                    .min(1)
                    .openapi({ examples: [1, 25, 50, 300] }),
                ),
                sortBy: SortableAttributeSchema,
                sortOrder: z
                  .enum(["asc", "desc"], { description: "The order in which to sort the stocks." })
                  .default("asc")
                  .openapi({ examples: ["asc", "desc"] }),
                q: z
                  .string({ description: "A query to identify a stock by its ticker, ISIN or name." })
                  .min(1)
                  .openapi({ examples: ["aapl", "US0378331005", "apple"] }),
                countries: z
                  .array(CountrySchema, {
                    description:
                      "A list of 2-letter ISO 3166-1 country codes of the countries of the operational headquarters " +
                      "of the stocks.",
                  })
                  .or(CountrySchema.transform((value) => [value])), // see honojs/middleware#660
                industries: z
                  .array(IndustrySchema, {
                    description:
                      "A list of main industries the companies operate in, as part of the " +
                      "Morningstar Global Equity Classification Structure.",
                  })
                  .or(IndustrySchema.transform((value) => [value])), // see honojs/middleware#660
                size: SizeSchema,
                style: StyleSchema,
                starRatingMin: ValidationHelper.coerceToInteger(StarRatingSchema).describe(
                  "The minimum star rating of a stock.",
                ),
                starRatingMax: ValidationHelper.coerceToInteger(StarRatingSchema).describe(
                  "The maximum star rating of a stock.",
                ),
                dividendYieldPercentMin: ValidationHelper.coerceToNumber(DividendYieldPercentSchema).describe(
                  "The minimum dividend yield of a stock, in percent.",
                ),
                dividendYieldPercentMax: ValidationHelper.coerceToNumber(DividendYieldPercentSchema).describe(
                  "The maximum dividend yield of a stock, in percent.",
                ),
                priceEarningRatioMin: ValidationHelper.coerceToNumber(PriceEarningRatioSchema).describe(
                  "The minimum price-earning ratio of a stock.",
                ),
                priceEarningRatioMax: ValidationHelper.coerceToNumber(PriceEarningRatioSchema).describe(
                  "The maximum price-earning ratio of a stock.",
                ),
                morningstarFairValueDiffMin: ValidationHelper.coerceToNumber(
                  MorningstarFairValuePercentageToLastCloseSchema,
                ).describe(
                  "The minimum percentage difference between Morningstar’s fair value estimate " +
                    "and the last close price of a stock.",
                ),
                morningstarFairValueDiffMax: ValidationHelper.coerceToNumber(
                  MorningstarFairValuePercentageToLastCloseSchema,
                ).describe(
                  "The maximum percentage difference between Morningstar’s fair value estimate " +
                    "and the last close price of a stock.",
                ),
                analystConsensusMin: AnalystConsensusSchema.describe(
                  "The minimum consensus of analysts’ opinions on a stock, that is, " +
                    "the mean value of all analyst ratings.",
                ),
                analystConsensusMax: AnalystConsensusSchema.describe(
                  "The maximum consensus of analysts’ opinions on a stock, that is, " +
                    "the mean value of all analyst ratings.",
                ),
                analystCountMin: ValidationHelper.coerceToInteger(AnalystCountSchema).describe(
                  "The minimum number of analysts that cover a stock.",
                ),
                analystCountMax: ValidationHelper.coerceToInteger(AnalystCountSchema).describe(
                  "The maximum number of analysts that cover a stock.",
                ),
                analystTargetDiffMin: ValidationHelper.coerceToNumber(
                  AnalystTargetPricePercentageToLastCloseSchema,
                ).describe(
                  "The minimum percentage difference between the average target price of analysts " +
                    "and the last close price of a stock.",
                ),
                analystTargetDiffMax: ValidationHelper.coerceToNumber(
                  AnalystTargetPricePercentageToLastCloseSchema,
                ).describe(
                  "The maximum percentage difference between the average target price of analysts " +
                    "and the last close price of a stock.",
                ),
                msciESGRatingMin: MSCIESGRatingSchema.describe("The minimum MSCI ESG rating of a stock."),
                msciESGRatingMax: MSCIESGRatingSchema.describe("The maximum MSCI ESG rating of a stock."),
                msciTemperatureMin: ValidationHelper.coerceToNumber(MSCITemperatureSchema).describe(
                  "The minimum MSCI Implied Temperature rise of a stock.",
                ),
                msciTemperatureMax: ValidationHelper.coerceToNumber(MSCITemperatureSchema).describe(
                  "The maximum MSCI Implied Temperature rise of a stock.",
                ),
                lsegESGScoreMin: ValidationHelper.coerceToInteger(LSEGESGScoreSchema).describe(
                  "The minimum LSEG ESG score of a stock.",
                ),
                lsegESGScoreMax: ValidationHelper.coerceToInteger(LSEGESGScoreSchema).describe(
                  "The maximum LSEG ESG score of a stock.",
                ),
                lsegEmissionsMin: ValidationHelper.coerceToInteger(LSEGEmissionsSchema).describe(
                  "The minimum LSEG Emissions rating of a stock.",
                ),
                lsegEmissionsMax: ValidationHelper.coerceToInteger(LSEGEmissionsSchema).describe(
                  "The maximum LSEG Emissions rating of a stock.",
                ),
                spESGScoreMin: ValidationHelper.coerceToInteger(SPESGScoreSchema).describe(
                  "The minimum Standard & Poor’s ESG score of a stock.",
                ),
                spESGScoreMax: ValidationHelper.coerceToInteger(SPESGScoreSchema).describe(
                  "The maximum Standard & Poor’s ESG score of a stock.",
                ),
                sustainalyticsESGRiskMin: ValidationHelper.coerceToNumber(SustainalyticsESGRiskSchema).describe(
                  "The minimum Sustainalytics ESG risk rating of a stock.",
                ),
                sustainalyticsESGRiskMax: ValidationHelper.coerceToNumber(SustainalyticsESGRiskSchema).describe(
                  "The maximum Sustainalytics ESG risk rating of a stock.",
                ),
                financialScoreMin: ValidationHelper.coerceToNumber(FinancialScoreSchema).describe(
                  "The minimum financial score of a stock.",
                ),
                financialScoreMax: ValidationHelper.coerceToNumber(FinancialScoreSchema).describe(
                  "The maximum financial score of a stock.",
                ),
                esgScoreMin: ValidationHelper.coerceToNumber(ESGScoreSchema).describe(
                  "The minimum ESG score of a stock.",
                ),
                esgScoreMax: ValidationHelper.coerceToNumber(ESGScoreSchema).describe(
                  "The maximum ESG score of a stock.",
                ),
                totalScoreMin: ValidationHelper.coerceToNumber(TotalScoreSchema).describe(
                  "The minimum total score of a stock.",
                ),
                totalScoreMax: ValidationHelper.coerceToNumber(TotalScoreSchema).describe(
                  "The maximum total score of a stock.",
                ),
                watchlist: ValidationHelper.coerceToInteger(WatchlistIDSchema).describe(
                  "The ID of a watchlist holding the stocks to be returned.",
                ),
                portfolio: ValidationHelper.coerceToInteger(PortfolioIDSchema).describe(
                  "The ID of a portfolio holding the stocks to be returned.",
                ),
              })
              .partial()
              .strict(),
          },
          responses: {
            200: {
              description: "OK: The list of stocks and the total count after filtering and before pagination.",
              content: { "application/json": { schema: StockListWithCountSchema } },
            },
            400: {
              description: "Bad Request: Invalid query parameters.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const { sortBy, sortOrder, offset, count, ...filter } = c.req.valid("query");
          return c.json(
            await this.stockService.readAll(
              { ...filter, email: c.get("user")!.email },
              { sortBy, sortOrder },
              { offset, count },
            ),
            200,
          );
        },
      )
      .openapi(
        createRoute({
          method: "get",
          path: "/{ticker}",
          tags: this.tags,
          summary: "Get a stock",
          description: "Reads a single stock from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: { params: z.object({ ticker: TickerSchema }).strict() },
          responses: {
            200: {
              description: "OK: The requested stock.",
              content: { "application/json": { schema: StockSchema } },
            },
            400: {
              description: "Bad Request: Invalid path parameters.",
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
        async (c) => c.json(await this.stockService.read(c.req.valid("param").ticker), 200),
      )
      .openapi(
        createRoute({
          method: "get",
          path: `/{ticker}${stockLogoEndpointSuffix}`,
          tags: this.tags,
          summary: "Get the logo of a stock",
          description: "Fetches the logo of a stock from the cache or TradeRepublic.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: {
            params: z.object({ ticker: TickerSchema }).strict(),
            query: z.object({ variant: LogoVariantSchema }),
          },
          responses: {
            200: {
              description: "OK: The logo of the stock.",
              content: { "image/svg+xml": { schema: LogoSchema } },
            },
            400: {
              description: "Bad Request: Invalid path or query parameters.",
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
          const logoResource = await this.stockService.readLogo(
            c.req.valid("param").ticker,
            c.req.valid("query").variant,
          );
          return c.body(logoResource.content, 200, {
            "Content-Type": logoResource.contentType,
            // Allow client-side caching as long as the logo is valid in the cache
            "Cache-Control": `max-age=${Math.trunc((logoResource.expiresAt.getTime() - Date.now()) / 1000)}`,
          }) as unknown as TypedResponse<z.infer<typeof LogoSchema>, 200, "json">;
        },
      )
      .openapi(
        createRoute({
          method: "put",
          path: "/{ticker}",
          tags: this.tags,
          summary: "Create a new stock",
          description: "Creates a new stock in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)] as const,
          request: {
            params: z.object({ ticker: TickerSchema }).strict(),
            body: {
              description: "Properties of the stock to be created.",
              required: true,
              content: {
                "application/json": {
                  schema: z.object({ name: NameSchema, isin: ISINSchema, country: CountrySchema }).strict(),
                },
              },
            },
          },
          responses: {
            201: { description: "Created: The stock was created successfully." },
            400: {
              description: "Bad Request: Invalid path or body parameters.",
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
            409: {
              description: "Conflict: A stock with that ticker exists already.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          if (await this.stockService.create({ ...c.req.valid("json"), ...c.req.valid("param") }))
            return c.body(null, 201);
          else throw new ConflictError(`A stock with the ticker ${c.req.valid("param").ticker} exists already.`);
        },
      )
      .openapi(
        createRoute({
          method: "patch",
          path: "",
          tags: this.tags,
          summary: "(Re-)Compute dynamic attributes of all stocks",
          description: "(Re-)Computes dynamic attributes of all stocks.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)] as const,
          responses: {
            204: { description: "No Content: The computation was successful." },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.stockService.computeDynamicAttributes();
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "patch",
          path: "/{ticker}",
          tags: this.tags,
          summary: "Update a stock",
          description: "Updates a stock in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)] as const,
          request: {
            params: z.object({ ticker: TickerSchema }).strict(),
            body: {
              description: "Properties to update in the stock.",
              required: true,
              content: {
                "application/json": {
                  schema: z
                    .object({
                      ticker: TickerSchema,
                      name: NameSchema,
                      isin: ISINSchema,
                      country: CountrySchema,
                      morningstarID: MorningstarIDSchema.nullable(),
                      marketScreenerID: MarketScreenerIDSchema.nullable(),
                      msciID: MSCIIDSchema.nullable(),
                      ric: RICSchema.nullable(),
                      spID: SPIDSchema.nullable(),
                      sustainalyticsID: SustainalyticsIDSchema.nullable(),
                    })
                    .partial()
                    .strict(),
                },
              },
            },
          },
          responses: {
            204: { description: "No Content: The stock was updated successfully." },
            400: {
              description: "Bad Request: Invalid path or body parameters.",
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
              description: "Not Found: No stock with the given ticker exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.stockService.update(c.req.valid("param").ticker, c.req.valid("json"));
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "delete",
          path: "/{ticker}",
          tags: this.tags,
          summary: "Delete a stock",
          description: "Deletes a stock from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS + WRITE_STOCKS_ACCESS)] as const,
          request: { params: z.object({ ticker: TickerSchema }).strict() },
          responses: {
            204: { description: "No Content: The stock was deleted successfully." },
            400: {
              description: "Bad Request: Invalid path parameters.",
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
          },
        }),
        async (c) => {
          await this.stockService.delete(c.req.valid("param").ticker);
          return c.body(null, 204);
        },
      );
  }
}

export default StockController;
