import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

/**
 * The zero-based offset of a list. Used for pagination.
 */
export const offset: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "offset",
  description: "The zero-based offset of a list. Used for pagination.",
  schema: {
    type: "number",
    example: 0,
  },
};

/**
 * The number of entities to be returned. If omitted, all entities known to the service will be returned (maximum:
 * 10000).
 */
export const count: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "count",
  description:
    "The number of entities to be returned. If omitted, all entities known to the service will be returned " +
    "(maximum: 10000).",
  schema: {
    type: "number",
    example: 5,
  },
};

/**
 * A parameter by which a list is to be sorted.
 */
export const sortBy: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "sortBy",
  description: "A parameter by which a list is to be sorted.",
  schema: {
    $ref: "#/components/schemas/SortableAttribute",
  },
};

/**
 * Whether to sort descending.
 */
export const sortDesc: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "sortDesc",
  description: "Whether to sort descending.",
  schema: {
    type: "boolean",
    example: false,
  },
};

/**
 * The ticker symbol of a stock.
 */
export const ticker: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "ticker",
  description: "The ticker symbol of a stock.",
  schema: {
    type: "string",
    example: "AAPL",
  },
};

/**
 * The name of a stock.
 */
export const name: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "name",
  description: "The name of a stock",
  schema: {
    type: "string",
    example: "Apple Inc.",
  },
};

/**
 * The ISIN of a stock.
 */
export const isin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "isin",
  description: "The ISIN of a stock.",
  schema: {
    type: "string",
    example: "US0378331005",
  },
};

/**
 * A country a stock is based in.
 */
export const country: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "country",
  description: "A country a stock is based in.",
  explode: false,
  schema: {
    type: "array",
    items: {
      $ref: "#/components/schemas/Country",
    },
  },
};

/**
 * An industry a stock operates in.
 */
export const industry: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "industry",
  description: "An industry a stock operates in.",
  explode: false,
  schema: {
    type: "array",
    items: {
      $ref: "#/components/schemas/Industry",
    },
  },
};

/**
 * A stock size.
 */
export const size: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "size",
  description: "A stock size.",
  schema: {
    $ref: "#/components/schemas/Size",
  },
};

/**
 * A stock style.
 */
export const style: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "style",
  description: "A stock style.",
  schema: {
    $ref: "#/components/schemas/Style",
  },
};

/**
 * The identifier of a stock used by Morningstar.
 */
export const morningstarID: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "morningstarID",
  description: "The identifier of a stock used by Morningstar",
  schema: {
    type: "string",
    example: "0P000000GY",
  },
};

/**
 * The identifier of a stock used by Market Screener.
 */
export const marketScreenerID: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "marketScreenerID",
  description: "The identifier of a stock used by Market Screener",
  schema: {
    type: "string",
    example: "APPLE-INC-4849",
  },
};

/**
 * The identifier of a stock used by MSCI.
 */
export const msciID: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciID",
  description: "The identifier of a stock used by MSCI",
  schema: {
    type: "string",
    example: "apple-inc/IID000000002157615",
  },
};

/**
 * The Reuters Instrument Code of a stock used by Refintiv.
 */
export const ric: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "ric",
  description: "The Reuters Instrument Code of a stock used by Refintiv",
  schema: {
    type: "string",
    example: "AAPL.O",
  },
};

/**
 * The identifier of a stock used by Standard & Poor’s.
 */
export const spID: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "spID",
  description: "The identifier of a stock used by Standard & Poor’s",
  schema: {
    type: "integer",
    nullable: true,
    example: "4004205",
  },
};

/**
 * The identifier of a stock used by Sustainalytics.
 */
export const sustainalyticsID: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "sustainalyticsID",
  description: "The identifier of a stock used by Sustainalytics",
  schema: {
    type: "string",
    example: "apple-inc/1007903183",
  },
};

/**
 * The minimum star rating of a stock.
 */
export const starRatingMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "starRatingMin",
  description: "The minimum star rating of a stock.",
  schema: {
    type: "number",
    example: 1,
  },
};

/**
 * The maximum star rating of a stock.
 */
export const starRatingMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "starRatingMax",
  description: "The maximum star rating of a stock.",
  schema: {
    type: "number",
    example: 5,
  },
};

/**
 * The minimum dividend yield of a stock.
 */
export const dividendYieldPercentMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "dividendYieldPercentMin",
  description: "The minimum dividend yield of a stock.",
  schema: {
    type: "number",
    example: 0.3,
  },
};

/**
 * The maximum dividend yield of a stock.
 */
export const dividendYieldPercentMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "dividendYieldPercentMax",
  description: "The maximum dividend yield of a stock.",
  schema: {
    type: "number",
    example: 7.1,
  },
};

/**
 * The minimum price-earning ratio of a stock.
 */
export const priceEarningRatioMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "priceEarningRatioMin",
  description: "The minimum price-earning ratio of a stock.",
  schema: {
    type: "number",
    example: 10,
  },
};

/**
 * The maximum price-earning ratio of a stock.
 */
export const priceEarningRatioMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "priceEarningRatioMax",
  description: "The maximum price-earning ratio of a stock.",
  schema: {
    type: "number",
    example: 30,
  },
};

/**
 * The minimum difference between a stock’s fair value and its price.
 */
export const morningstarFairValueDiffMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "morningstarFairValueDiffMin",
  description: "The minimum difference between a stock’s fair value and its price.",
  schema: {
    type: "number",
    example: -40,
  },
};

/**
 * The maximum difference between a stock’s fair value and its price.
 */
export const morningstarFairValueDiffMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "morningstarFairValueDiffMax",
  description: "The maximum difference between a stock’s fair value and its price.",
  schema: {
    type: "number",
    example: 10,
  },
};

/**
 * The minimum analyst consensus of a stock.
 */
export const analystConsensusMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystConsensusMin",
  description: "The minimum analyst consensus of a stock.",
  schema: {
    type: "number",
    example: 5.5,
  },
};

/**
 * The maximum analyst consensus of a stock.
 */
export const analystConsensusMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystConsensusMax",
  description: "The maximum analyst consensus of a stock.",
  schema: {
    type: "number",
    example: 9.5,
  },
};

/**
 * The minimum difference between a stock’s analyst target price and its price.
 */
export const analystTargetDiffMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystTargetDiffMin",
  description: "The minimum difference between a stock’s analyst target price and its price.",
  schema: {
    type: "number",
    example: -40,
  },
};

/**
 * The maximum difference between a stock’s analyst target price and its price.
 */
export const analystTargetDiffMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystTargetDiffMax",
  description: "The maximum difference between a stock’s analyst target price and its price.",
  schema: {
    type: "number",
    example: 10,
  },
};

/**
 * The minimum number of analysts that cover a stock.
 */
export const analystCountMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystCountMin",
  description: "The minimum number of analysts that cover a stock.",
  schema: {
    type: "number",
    example: 5,
  },
};

/**
 * The maximum number of analysts that cover a stock.
 */
export const analystCountMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystCountMax",
  description: "The maximum number of analysts that cover a stock.",
  schema: {
    type: "number",
    example: 20,
  },
};

/**
 * The minimum MSCI ESG rating of a stock.
 */
export const msciESGRatingMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciESGRatingMin",
  description: "The minimum MSCI ESG rating of a stock.",
  schema: {
    $ref: "#/components/schemas/MSCIESGRating",
  },
};

/**
 * The maximum MSCI ESG rating of a stock.
 */
export const msciESGRatingMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciESGRatingMax",
  description: "The maximum MSCI ESG rating of a stock.",
  schema: {
    $ref: "#/components/schemas/MSCIESGRating",
  },
};

/**
 * The minimum MSCI Implied Temperature Rise of a stock.
 */
export const msciTemperatureMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciTemperatureMin",
  description: "The minimum MSCI Implied Temperature Rise of a stock.",
  schema: {
    type: "number",
    example: 1.2,
  },
};

/**
 * The maximum MSCI Implied Temperature Rise of a stock.
 */
export const msciTemperatureMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciTemperatureMax",
  description: "The maximum MSCI Implied Temperature Rise of a stock.",
  schema: {
    type: "number",
    example: 1.8,
  },
};

/**
 * The minimum Refinitiv ESG score of a stock.
 */
export const refinitivESGScoreMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "refinitivESGScoreMin",
  description: "The minimum Refinitiv ESG score of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

/**
 * The maximum Refinitiv ESG score of a stock.
 */
export const refinitivESGScoreMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "refinitivESGScoreMax",
  description: "The maximum Refinitiv ESG score of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

export const refinitivEmissionsMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "refinitivEmissionsMin",
  description: "The minimum Refinitiv Emissions rating of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

/**
 * The maximum Refinitiv Emissions rating of a stock.
 */
export const refinitivEmissionsMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "refinitivEmissionsMax",
  description: "The maximum Refinitiv Emissions rating of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

/**
 * The minimum S&P ESG score of a stock.
 */
export const spESGScoreMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "spESGScoreMin",
  description: "The minimum S&P ESG score of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

/**
 * The maximum S&P ESG score of a stock.
 */
export const spESGScoreMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "spESGScoreMax",
  description: "The maximum S&P ESG score of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

/**
 * The minimum Sustainalytics ESG risk rating of a stock.
 */
export const sustainalyticsESGRiskMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "sustainalyticsESGRiskMin",
  description: "The minimum Sustainalytics ESG risk rating of a stock.",
  schema: {
    type: "number",
    example: 2.5,
  },
};

/**
 * The maximum Sustainalytics ESG risk rating of a stock.
 */
export const sustainalyticsESGRiskMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "sustainalyticsESGRiskMax",
  description: "The maximum Sustainalytics ESG risk rating of a stock.",
  schema: {
    type: "number",
    example: 19.5,
  },
};

/**
 * The minimum financial score of a stock.
 */
export const financialScoreMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "financialScoreMin",
  description: "The minimum financial score of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

/**
 * The maximum financial score of a stock.
 */
export const financialScoreMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "financialScoreMax",
  description: "The maximum financial score of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

/**
 * The minimum ESG score of a stock.
 */
export const esgScoreMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "esgScoreMin",
  description: "The minimum ESG score of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

/**
 * The maximum ESG score of a stock.
 */
export const esgScoreMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "esgScoreMax",
  description: "The maximum ESG score of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

/**
 * The minimum total score of a stock.
 */
export const totalScoreMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "totalScoreMin",
  description: "The minimum total score of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

/**
 * The maximum total score of a stock.
 */
export const totalScoreMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "totalScoreMax",
  description: "The maximum total score of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};
