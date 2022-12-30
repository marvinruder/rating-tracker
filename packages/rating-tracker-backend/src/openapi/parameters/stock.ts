import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

const offset: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "offset",
  description: "The zero-based offset of a list. Used for pagination.",
  schema: {
    type: "number",
    example: 0,
  },
};

const count: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "count",
  description:
    "The number of entities to be returned. If omitted, all entities known to the service will be returned (maximum: 10000).",
  schema: {
    type: "number",
    example: 5,
  },
};

const sortBy: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "sortBy",
  description: "A parameter by which a list is to be sorted.",
  schema: {
    $ref: "#/components/schemas/SortableAttribute",
  },
};

const sortDesc: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "sortDesc",
  description: "Whether to sort descending.",
  schema: {
    type: "boolean",
    example: false,
  },
};

const ticker: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "ticker",
  description: "The ticker symbol of a stock.",
  schema: {
    type: "string",
    example: "AAPL",
  },
};

const name: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "name",
  description: "The name of a stock",
  schema: {
    type: "string",
    example: "Apple Inc.",
  },
};

const isin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "isin",
  description: "The ISIN of a stock.",
  schema: {
    type: "string",
    example: "US0378331005",
  },
};

const country: OpenAPIV3.ParameterObject = {
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

const industry: OpenAPIV3.ParameterObject = {
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

const size: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "size",
  description: "A stock size.",
  schema: {
    $ref: "#/components/schemas/Size",
  },
};

const style: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "style",
  description: "A stock style.",
  schema: {
    $ref: "#/components/schemas/Style",
  },
};

const morningstarId: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "morningstarId",
  description: "The identifier of a stock used by Morningstar",
  schema: {
    type: "string",
    example: "0P000000GY",
  },
};

const marketScreenerId: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "marketScreenerId",
  description: "The identifier of a stock used by Market Screener",
  schema: {
    type: "string",
    example: "APPLE-INC-4849",
  },
};

const msciId: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciId",
  description: "The identifier of a stock used by MSCI",
  schema: {
    type: "string",
    example: "apple-inc/IID000000002157615",
  },
};

const ric: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "ric",
  description: "The Reuters Instrument Code of a stock used by Refintiv",
  schema: {
    type: "string",
    example: "AAPL.O",
  },
};

const spId: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "spId",
  description: "The identifier of a stock used by Standard & Poor's",
  schema: {
    type: "integer",
    example: "4004205",
  },
};

const sustainalyticsId: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "sustainalyticsId",
  description: "The identifier of a stock used by Sustainalytics",
  schema: {
    type: "string",
    example: "apple-inc/1007903183",
  },
};

const starRatingMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "starRatingMin",
  description: "The minimum star rating of a stock.",
  schema: {
    type: "number",
    example: 1,
  },
};

const starRatingMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "starRatingMax",
  description: "The maximum star rating of a stock.",
  schema: {
    type: "number",
    example: 5,
  },
};

const dividendYieldPercentMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "dividendYieldPercentMin",
  description: "The minimum dividend yield of a stock.",
  schema: {
    type: "number",
    example: 0.3,
  },
};

const dividendYieldPercentMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "dividendYieldPercentMax",
  description: "The maximum dividend yield of a stock.",
  schema: {
    type: "number",
    example: 7.1,
  },
};

const priceEarningRatioMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "priceEarningRatioMin",
  description: "The minimum price-earning ratio of a stock.",
  schema: {
    type: "number",
    example: 10,
  },
};

const priceEarningRatioMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "priceEarningRatioMax",
  description: "The maximum price-earning ratio of a stock.",
  schema: {
    type: "number",
    example: 30,
  },
};

const morningstarFairValueDiffMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "morningstarFairValueDiffMin",
  description:
    "The minimum difference between a stock’s fair value and its price.",
  schema: {
    type: "number",
    example: -40,
  },
};

const morningstarFairValueDiffMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "morningstarFairValueDiffMax",
  description:
    "The maximum difference between a stock’s fair value and its price.",
  schema: {
    type: "number",
    example: 10,
  },
};

const analystConsensusMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystConsensusMin",
  description: "The minimum analyst consensus of a stock.",
  schema: {
    type: "number",
    example: 5.5,
  },
};

const analystConsensusMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystConsensusMax",
  description: "The maximum analyst consensus of a stock.",
  schema: {
    type: "number",
    example: 9.5,
  },
};

const analystTargetDiffMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystTargetDiffMin",
  description:
    "The minimum difference between a stock’s analyst target price and its price.",
  schema: {
    type: "number",
    example: -40,
  },
};

const analystTargetDiffMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystTargetDiffMax",
  description:
    "The maximum difference between a stock’s analyst target price and its price.",
  schema: {
    type: "number",
    example: 10,
  },
};

const analystCountMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystCountMin",
  description: "The minimum number of analysts that cover a stock.",
  schema: {
    type: "number",
    example: 5,
  },
};

const analystCountMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "analystCountMax",
  description: "The maximum number of analysts that cover a stock.",
  schema: {
    type: "number",
    example: 20,
  },
};

const msciESGRatingMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciESGRatingMin",
  description: "The minimum MSCI ESG rating of a stock.",
  schema: {
    $ref: "#/components/schemas/MSCIESGRating",
  },
};

const msciESGRatingMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciESGRatingMax",
  description: "The maximum MSCI ESG rating of a stock.",
  schema: {
    $ref: "#/components/schemas/MSCIESGRating",
  },
};

const msciTemperatureMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciTemperatureMin",
  description: "The minimum MSCI Implied Temperature Rise of a stock.",
  schema: {
    type: "number",
    example: 1.2,
  },
};

const msciTemperatureMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciTemperatureMax",
  description: "The maximum MSCI Implied Temperature Rise of a stock.",
  schema: {
    type: "number",
    example: 1.8,
  },
};

const refinitivESGScoreMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "refinitivESGScoreMin",
  description: "The minimum Refinitiv ESG score of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

const refinitivESGScoreMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "refinitivESGScoreMax",
  description: "The maximum Refinitiv ESG score of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

const refinitivEmissionsMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "refinitivEmissionsMin",
  description: "The minimum Refinitiv Emissions rating of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

const refinitivEmissionsMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "refinitivEmissionsMax",
  description: "The maximum Refinitiv Emissions rating of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

const spESGScoreMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "spESGScoreMin",
  description: "The minimum S&P ESG score of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

const spESGScoreMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "spESGScoreMax",
  description: "The maximum S&P ESG score of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

const sustainalyticsESGRiskMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "sustainalyticsESGRiskMin",
  description: "The minimum Sustainalytics ESG risk rating of a stock.",
  schema: {
    type: "number",
    example: 2.5,
  },
};

const sustainalyticsESGRiskMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "sustainalyticsESGRiskMax",
  description: "The maximum Sustainalytics ESG risk rating of a stock.",
  schema: {
    type: "number",
    example: 19.5,
  },
};

const financialScoreMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "financialScoreMin",
  description: "The minimum financial score of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

const financialScoreMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "financialScoreMax",
  description: "The maximum financial score of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

const esgScoreMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "esgScoreMin",
  description: "The minimum ESG score of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

const esgScoreMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "esgScoreMax",
  description: "The maximum ESG score of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

const totalScoreMin: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "totalScoreMin",
  description: "The minimum total score of a stock.",
  schema: {
    type: "number",
    example: 50,
  },
};

const totalScoreMax: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "totalScoreMax",
  description: "The maximum total score of a stock.",
  schema: {
    type: "number",
    example: 95,
  },
};

export {
  offset,
  count,
  sortBy,
  sortDesc,
  ticker,
  name,
  isin,
  country,
  industry,
  size,
  style,
  morningstarId,
  marketScreenerId,
  msciId,
  ric,
  spId,
  sustainalyticsId,
  starRatingMin,
  starRatingMax,
  dividendYieldPercentMin,
  dividendYieldPercentMax,
  priceEarningRatioMin,
  priceEarningRatioMax,
  morningstarFairValueDiffMin,
  morningstarFairValueDiffMax,
  analystConsensusMin,
  analystConsensusMax,
  analystCountMin,
  analystCountMax,
  analystTargetDiffMin,
  analystTargetDiffMax,
  msciESGRatingMin,
  msciESGRatingMax,
  msciTemperatureMin,
  msciTemperatureMax,
  refinitivESGScoreMin,
  refinitivESGScoreMax,
  refinitivEmissionsMin,
  refinitivEmissionsMax,
  spESGScoreMin,
  spESGScoreMax,
  sustainalyticsESGRiskMin,
  sustainalyticsESGRiskMax,
  financialScoreMin,
  financialScoreMax,
  esgScoreMin,
  esgScoreMax,
  totalScoreMin,
  totalScoreMax,
};
