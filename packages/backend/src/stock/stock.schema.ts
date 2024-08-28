import { z } from "@hono/zod-openapi";
import {
  analystRatingArray,
  countryArray,
  currencyArray,
  DUMMY_SVG,
  industryArray,
  msciESGRatingArray,
  sizeArray,
  sortableAttributeArray,
  styleArray,
} from "@rating-tracker/commons";

import { portfolioExamples, stockExamples } from "../utils/examples";

/**
 * The ticker symbol of a stock.
 */
export const TickerSchema = z
  .string({ description: "The ticker symbol of a stock." })
  .max(20)
  .regex(/^_?[A-Z0-9-]+(\.[A-Z]+)?$/)
  .openapi({ examples: stockExamples.map((stock) => stock.ticker) });

/**
 * The name of a stock.
 */
export const NameSchema = z
  .string({ description: "The name of a stock." })
  .min(1)
  .max(255)
  .openapi({ examples: stockExamples.map((stock) => stock.name) });

/**
 * The International Securities Identification Number of a stock.
 */
export const ISINSchema = z
  .string({ description: "The International Securities Identification Number of a stock." })
  .length(12)
  .regex(/^[A-Z]{2}[A-Z0-9]{10}$/)
  .openapi({ examples: stockExamples.map((stock) => stock.isin) });

/**
 * The 2-letter ISO 3166-1 country code of the country of the operational headquarters of a stock.
 */
export const CountrySchema = z
  .enum(countryArray, {
    description: "The 2-letter ISO 3166-1 country code of the country of the operational headquarters of a stock.",
  })
  .openapi({ examples: stockExamples.map((stock) => stock.country) });

/**
 * The main industry a company operates in, as part of the Morningstar Global Equity Classification Structure.
 */
export const IndustrySchema = z
  .enum(industryArray, {
    description:
      "The main industry a company operates in, as part of the Morningstar Global Equity Classification Structure.",
  })
  .openapi({ examples: stockExamples.filter((stock) => stock.industry !== null).map((stock) => stock.industry!) });

/**
 * The size of a stock as part of the Morningstar Style Box. Based on its market capitalization and geographic area.
 */
export const SizeSchema = z
  .enum(sizeArray, {
    description:
      "The size of a stock as part of the Morningstar Style Box. " +
      "Based on its market capitalization and geographic area.",
  })
  .openapi({ examples: stockExamples.filter((stock) => stock.size !== null).map((stock) => stock.size!) });

/**
 * The style of a stock as part of the Morningstar Style Box.
 * Based on the value and growth characteristics of a company.
 */
export const StyleSchema = z
  .enum(styleArray, {
    description:
      "The style of a stock as part of the Morningstar Style Box. " +
      "Based on the value and growth characteristics of a company.",
  })
  .openapi({ examples: stockExamples.filter((stock) => stock.style !== null).map((stock) => stock.style!) });

/**
 * A stock’s score based on its financial ratings.
 */
export const FinancialScoreSchema = z
  .number({ description: "A stock’s score based on its financial ratings." })
  .max(1)
  .openapi({ examples: stockExamples.map((stock) => stock.financialScore) });

/**
 * A stock’s score based on its ESG ratings.
 */
export const ESGScoreSchema = z
  .number({ description: "A stock’s score based on its ESG ratings." })
  .max(1)
  .openapi({ examples: stockExamples.map((stock) => stock.esgScore) });

/**
 * A stock’s score based on both its financial and ESG ratings.
 */
export const TotalScoreSchema = z
  .number({ description: "A stock’s score based on both its financial and ESG ratings." })
  .max(1)
  .openapi({ examples: stockExamples.map((stock) => stock.totalScore) });

/**
 * The date and time of the last fetch of a stock from Yahoo Finance.
 */
export const YahooLastFetchSchema = z
  .date({ description: "The date and time of the last fetch of a stock from Yahoo Finance." })
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.yahooLastFetch !== null)
      .map((stock) => stock.yahooLastFetch!.toISOString()),
  });

/**
 * The 3-letter ISO 4217 currency code of the currency a stock is traded in.
 */
export const CurrencySchema = z
  .enum(currencyArray, {
    description: "The 3-letter ISO 4217 currency code of the currency a stock is traded in.",
  })
  .openapi({ examples: stockExamples.filter((stock) => stock.currency !== null).map((stock) => stock.currency!) });

/**
 * A stock’s price at the end of the previous trading day.
 */
export const LastCloseSchema = z
  .number({ description: "A stock’s price at the end of the previous trading day." })
  .nonnegative()
  .openapi({
    examples: stockExamples.filter((stock) => stock.lastClose !== null).map((stock) => stock.lastClose!),
  });

/**
 * The lower bound of the 52-week range of a stock’s price.
 */
export const Low52wSchema = z
  .number({ description: "The lower bound of the 52-week range of a stock’s price." })
  .nonnegative()
  .openapi({ examples: stockExamples.filter((stock) => stock.low52w !== null).map((stock) => stock.low52w!) });

/**
 * The upper bound of the 52-week range of a stock’s price.
 */
export const High52wSchema = z
  .number({ description: "The upper bound of the 52-week range of a stock’s price." })
  .nonnegative()
  .openapi({ examples: stockExamples.filter((stock) => stock.high52w !== null).map((stock) => stock.high52w!) });

/**
 * A stock’s historical prices during the last year.
 */
export const Prices1ySchema = z
  .array(z.number().nonnegative(), {
    description: "A stock’s historical prices during the last year.",
  })
  .openapi({ examples: stockExamples.filter((stock) => stock.prices1y !== null).map((stock) => stock.prices1y!) });

/**
 * A stock’s historical prices during the last month.
 */
export const Prices1moSchema = z
  .array(z.number().nonnegative(), {
    description: "A stock’s historical prices during the last month.",
  })
  .openapi({
    examples: stockExamples.filter((stock) => stock.prices1mo !== null).map((stock) => stock.prices1mo!),
  });

/**
 * The identifier of a stock used by Morningstar.
 */
export const MorningstarIDSchema = z
  .string({ description: "The identifier of a stock used by Morningstar." })
  .max(255)
  .regex(/^0P[A-Z0-9]{8}$/)
  .openapi({
    examples: stockExamples.filter((stock) => stock.morningstarID !== null).map((stock) => stock.morningstarID!),
  });

/**
 * The date and time of the last fetch of a stock from Morningstar.
 */
export const MorningstarLastFetchSchema = z
  .date({ description: "The date and time of the last fetch of a stock from Morningstar." })
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.morningstarLastFetch !== null)
      .map((stock) => stock.morningstarLastFetch!.toISOString()),
  });

/**
 * The star rating of a stock.
 */
export const StarRatingSchema = z
  .number({ description: "The star rating of a stock." })
  .int()
  .min(1)
  .max(5)
  .openapi({
    examples: stockExamples.filter((stock) => stock.starRating !== null).map((stock) => stock.starRating!),
  });

/**
 * The dividend yield of a stock, in percent.
 */
export const DividendYieldPercentSchema = z
  .number({ description: "The dividend yield of a stock, in percent." })
  .nonnegative()
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.dividendYieldPercent !== null)
      .map((stock) => stock.dividendYieldPercent!),
  });

/**
 * The price-earning ratio of a stock.
 */
export const PriceEarningRatioSchema = z.number({ description: "The price-earning ratio of a stock." }).openapi({
  examples: stockExamples.filter((stock) => stock.priceEarningRatio !== null).map((stock) => stock.priceEarningRatio!),
});

/**
 * Morningstar’s fair value estimate for a stock.
 */
export const MorningstarFairValueSchema = z
  .number({ description: "Morningstar’s fair value estimate for a stock." })
  .nonnegative()
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.morningstarFairValue !== null)
      .map((stock) => stock.morningstarFairValue!),
  });

/**
 * The percentage difference between Morningstar’s fair value estimate and the last close price of a stock.
 *
 * Is computed dynamically at every database update.
 */
export const MorningstarFairValuePercentageToLastCloseSchema = z
  .number({
    description:
      "The percentage difference between Morningstar’s fair value estimate and the last close price of a stock.",
  })
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.morningstarFairValuePercentageToLastClose !== null)
      .map((stock) => stock.morningstarFairValuePercentageToLastClose!),
  });

/**
 * The market capitalization of a stock.
 */
export const MarketCapSchema = z
  .number({ description: "The market capitalization of a stock." })
  .nonnegative()
  .openapi({
    examples: stockExamples.filter((stock) => stock.marketCap !== null).map((stock) => stock.marketCap!),
  });

/**
 * The position of a stock’s last close price in the 52-week range.
 *
 * Is computed dynamically at every database update.
 */
export const PositionIn52wSchema = z
  .number({ description: "The position of a stock’s last close price in the 52-week range." })
  .min(0)
  .max(1)
  .openapi({
    examples: stockExamples.filter((stock) => stock.positionIn52w !== null).map((stock) => stock.positionIn52w!),
  });

/**
 * The identifier of a stock used by Market Screener.
 */
export const MarketScreenerIDSchema = z
  .string({ description: "The identifier of a stock used by Market Screener." })
  .max(255)
  .regex(/^[A-Z0-9-]+-[0-9]+$/)
  .openapi({
    examples: stockExamples.filter((stock) => stock.marketScreenerID !== null).map((stock) => stock.marketScreenerID!),
  });

/**
 * The date and time of the last fetch of a stock from Market Screener.
 */
export const MarketScreenerLastFetchSchema = z
  .date({ description: "The date and time of the last fetch of a stock from Market Screener." })
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.marketScreenerLastFetch !== null)
      .map((stock) => stock.marketScreenerLastFetch!.toISOString()),
  });

/**
 * The consensus of analysts’ opinions on a stock, that is, the mean value of all analyst ratings.
 */
export const AnalystConsensusSchema = z
  .enum(analystRatingArray, {
    description: "The consensus of analysts’ opinions on a stock, that is, the mean value of all analyst ratings.",
  })
  .openapi({
    examples: stockExamples.filter((stock) => stock.analystConsensus !== null).map((stock) => stock.analystConsensus!),
  });

/**
 * The ratings of analysts for a stock.
 */
export const AnalystRatingsSchema = z
  .record(
    z.enum(analystRatingArray, { description: "The ratings of analysts for a stock." }),
    z.number().int().nonnegative(),
    { description: "The ratings of analysts for a stock." },
  )
  .openapi({
    examples: stockExamples.filter((stock) => stock.analystRatings !== null).map((stock) => stock.analystRatings!),
  });

/**
 * The number of analysts that cover a stock.
 */
export const AnalystCountSchema = z
  .number({ description: "The number of analysts that cover a stock." })
  .int()
  .nonnegative()
  .openapi({
    examples: stockExamples.filter((stock) => stock.analystCount !== null).map((stock) => stock.analystCount!),
  });

/**
 * The average target price of analysts for a stock.
 */
export const AnalystTargetPriceSchema = z
  .number({ description: "The average target price of analysts for a stock." })
  .nonnegative()
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.analystTargetPrice !== null)
      .map((stock) => stock.analystTargetPrice!),
  });

/**
 * The percentage difference between the average target price of analysts and the last close price of a stock.
 *
 * Is computed dynamically at every database update.
 */
export const AnalystTargetPricePercentageToLastCloseSchema = z
  .number({
    description:
      "The percentage difference between the average target price of analysts and the last close price of a stock.",
  })
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.analystTargetPricePercentageToLastClose !== null)
      .map((stock) => stock.analystTargetPricePercentageToLastClose!),
  });

/**
 * The identifier of a stock used by MSCI.
 */
export const MSCIIDSchema = z
  .string({ description: "The identifier of a stock used by MSCI." })
  .max(255)
  .regex(/^IID[0-9]{15}$/)
  .openapi({ examples: stockExamples.filter((stock) => stock.msciID !== null).map((stock) => stock.msciID!) });

/**
 * The date and time of the last fetch of a stock from MSCI.
 */
export const MSCILastFetchSchema = z
  .date({ description: "The date and time of the last fetch of a stock from MSCI." })
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.msciLastFetch !== null)
      .map((stock) => stock.msciLastFetch!.toISOString()),
  });

/**
 * The MSCI ESG rating of a stock.
 */
export const MSCIESGRatingSchema = z
  .enum(msciESGRatingArray, {
    description: "The MSCI ESG rating of a stock.",
  })
  .openapi({
    examples: stockExamples.filter((stock) => stock.msciESGRating !== null).map((stock) => stock.msciESGRating!),
  });

/**
 * MSCI’s Implied Temperature rise of a stock.
 */
export const MSCITemperatureSchema = z
  .number({ description: "MSCI’s Implied Temperature rise of a stock." })
  .positive()
  .step(0.1)
  .openapi({
    examples: stockExamples.filter((stock) => stock.msciTemperature !== null).map((stock) => stock.msciTemperature!),
  });

/**
 * The Reuters Instrument Code of a stock used by LSEG.
 */
export const RICSchema = z
  .string({ description: "The Reuters Instrument Code of a stock used by LSEG." })
  .max(25)
  .regex(/^[A-Za-z0-9_]+(\.[A-Z]+)?$/)
  .openapi({ examples: stockExamples.filter((stock) => stock.ric !== null).map((stock) => stock.ric!) });

/**
 * The date and time of the last fetch of a stock from LSEG Data & Analytics.
 */
export const LSEGLastFetchSchema = z
  .date({ description: "The date and time of the last fetch of a stock from LSEG Data & Analytics." })
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.lsegLastFetch !== null)
      .map((stock) => stock.lsegLastFetch!.toISOString()),
  });

/**
 * LSEG’s ESG score of a stock.
 */
export const LSEGESGScoreSchema = z
  .number({ description: "LSEG’s ESG score of a stock." })
  .int()
  .min(0)
  .max(100)
  .openapi({
    examples: stockExamples.filter((stock) => stock.lsegESGScore !== null).map((stock) => stock.lsegESGScore!),
  });

/**
 * LSEG’s Emissions rating of a stock.
 */
export const LSEGEmissionsSchema = z
  .number({ description: "LSEG’s Emissions rating of a stock." })
  .int()
  .min(0)
  .max(100)
  .openapi({
    examples: stockExamples.filter((stock) => stock.lsegEmissions !== null).map((stock) => stock.lsegEmissions!),
  });

/**
 * The identifier of a stock used by Standard & Poor’s.
 */
export const SPIDSchema = z
  .number({ description: "The identifier of a stock used by Standard & Poor’s." })
  .int()
  .positive()
  .openapi({ examples: stockExamples.filter((stock) => stock.spID !== null).map((stock) => stock.spID!) });

/**
 * The date and time of the last fetch of a stock from Standard & Poor’s.
 */
export const SPLastFetchSchema = z
  .date({ description: "The date and time of the last fetch of a stock from Standard & Poor’s." })
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.spLastFetch !== null)
      .map((stock) => stock.spLastFetch!.toISOString()),
  });

/**
 * Standard & Poor’s ESG score of a stock.
 */
export const SPESGScoreSchema = z
  .number({ description: "Standard & Poor’s ESG score of a stock." })
  .int()
  .min(0)
  .max(100)
  .openapi({
    examples: stockExamples.filter((stock) => stock.spESGScore !== null).map((stock) => stock.spESGScore!),
  });

/**
 * The identifier of a stock used by Sustainalytics.
 */
export const SustainalyticsIDSchema = z
  .string({ description: "The identifier of a stock used by Sustainalytics." })
  .max(255)
  .regex(/^[a-z0-9-]+\/[0-9]{10}$/)
  .openapi({
    examples: stockExamples.filter((stock) => stock.sustainalyticsID !== null).map((stock) => stock.sustainalyticsID!),
  });

/**
 * Sustainalytics’ ESG risk rating of a stock.
 */
export const SustainalyticsESGRiskSchema = z
  .number({ description: "Sustainalytics’ ESG risk rating of a stock." })
  .nonnegative()
  .openapi({
    examples: stockExamples
      .filter((stock) => stock.sustainalyticsESGRisk !== null)
      .map((stock) => stock.sustainalyticsESGRisk!),
  });

/**
 * A description of a stock.
 */
export const DescriptionSchema = z.string({ description: "A description of a stock." }).openapi({
  examples: stockExamples.filter((stock) => stock.description !== null).map((stock) => stock.description!),
});

/**
 * A URL to the stock stub’s logo.
 */
export const LogoURLSchema = z
  .string({ description: "A URL to the stock stub’s logo." })
  .url()
  .nullable()
  .openapi({ examples: ["https://s.yimg.com/lb/brands/150x150_apple.png"] });

/**
 * An attribute name by which a list of stocks can be sorted.
 */
export const SortableAttributeSchema = z
  .enum(sortableAttributeArray, {
    description: "An attribute name by which a list of stocks can be sorted.",
  })
  .openapi({ examples: [...sortableAttributeArray] });

/**
 * The amount of currency associated with a stock.
 */
export const AmountSchema = z
  .number({ description: "The amount of currency associated with a stock." })
  .nonnegative()
  .openapi({ examples: portfolioExamples.flatMap((portfolio) => portfolio.stocks.map((stock) => stock.amount)) });

/**
 * A stock.
 */
export const StockSchema = z
  .object(
    {
      ticker: TickerSchema,
      name: NameSchema,
      isin: ISINSchema,
      country: CountrySchema,
      industry: IndustrySchema.nullable(),
      size: SizeSchema.nullable(),
      style: StyleSchema.nullable(),
      financialScore: FinancialScoreSchema,
      esgScore: ESGScoreSchema,
      totalScore: TotalScoreSchema,
      yahooLastFetch: YahooLastFetchSchema.nullable(),
      currency: CurrencySchema.nullable(),
      lastClose: LastCloseSchema.nullable(),
      low52w: Low52wSchema.nullable(),
      high52w: High52wSchema.nullable(),
      prices1y: Prices1ySchema.nullable(),
      prices1mo: Prices1moSchema.nullable(),
      morningstarID: MorningstarIDSchema.nullable(),
      morningstarLastFetch: MorningstarLastFetchSchema.nullable(),
      starRating: StarRatingSchema.nullable(),
      dividendYieldPercent: DividendYieldPercentSchema.nullable(),
      priceEarningRatio: PriceEarningRatioSchema.nullable(),
      morningstarFairValue: MorningstarFairValueSchema.nullable(),
      morningstarFairValuePercentageToLastClose: MorningstarFairValuePercentageToLastCloseSchema.nullable(),
      marketCap: MarketCapSchema.nullable(),
      positionIn52w: PositionIn52wSchema.nullable(),
      marketScreenerID: MarketScreenerIDSchema.nullable(),
      marketScreenerLastFetch: MarketScreenerLastFetchSchema.nullable(),
      analystConsensus: AnalystConsensusSchema.nullable(),
      analystRatings: AnalystRatingsSchema.nullable(),
      analystCount: AnalystCountSchema.nullable(),
      analystTargetPrice: AnalystTargetPriceSchema.nullable(),
      analystTargetPricePercentageToLastClose: AnalystTargetPricePercentageToLastCloseSchema.nullable(),
      msciID: MSCIIDSchema.nullable(),
      msciLastFetch: MSCILastFetchSchema.nullable(),
      msciESGRating: MSCIESGRatingSchema.nullable(),
      msciTemperature: MSCITemperatureSchema.nullable(),
      ric: RICSchema.nullable(),
      lsegLastFetch: LSEGLastFetchSchema.nullable(),
      lsegESGScore: LSEGESGScoreSchema.nullable(),
      lsegEmissions: LSEGEmissionsSchema.nullable(),
      spID: SPIDSchema.nullable(),
      spLastFetch: SPLastFetchSchema.nullable(),
      spESGScore: SPESGScoreSchema.nullable(),
      sustainalyticsID: SustainalyticsIDSchema.nullable(),
      sustainalyticsESGRisk: SustainalyticsESGRiskSchema.nullable(),
      description: DescriptionSchema.nullable(),
    },
    { description: "A stock." },
  )
  .openapi("Stock");

/**
 * A stock associated with an amount of a specified currency.
 */
export const WeightedStockSchema = StockSchema.extend({
  amount: AmountSchema,
})
  .describe("A stock associated with an amount of a specified currency.")
  .openapi("WeightedStock");

/**
 * A stub of a stock, provided by the Yahoo Finance API.
 */
export const YahooStockStubSchema = z
  .object(
    {
      ticker: TickerSchema,
      name: NameSchema,
      industry: IndustrySchema.nullable(),
      logoUrl: LogoURLSchema.nullable(),
    },
    { description: "A stub of a stock, provided by the Yahoo Finance API." },
  )
  .openapi("YahooStockStub");

/**
 * A stock list accompanied with the total number of stocks available with the current filter settings.
 */
export const StockListWithCountSchema = z
  .object(
    {
      stocks: z.array(StockSchema.or(WeightedStockSchema), { description: "The list of requested stocks." }),
      count: z
        .number({ description: "The total number of stocks available with the current filter settings." })
        .int()
        .nonnegative()
        .openapi({ examples: [0, 1, 25, 500] }),
    },
    {
      description:
        "A stock list accompanied with the total number of stocks available with the current filter settings.",
    },
  )
  .openapi("StockListWithCount");

/**
 * The SVG logo of a stock.
 */
export const LogoSchema = z
  .string({ description: "The SVG logo of a stock." })
  .max(128 * 1024)
  .openapi({ examples: [DUMMY_SVG] });

/**
 * The variant of a stock logo
 */
export const LogoVariantSchema = z
  .enum(["light", "dark"], { description: "The variant of a stock logo." })
  .openapi({ examples: ["light", "dark"] });
