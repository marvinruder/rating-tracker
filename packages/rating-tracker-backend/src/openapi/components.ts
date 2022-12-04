import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import {
  countryArray,
  industryArray,
  sizeArray,
  styleArray,
  sortableAttributeArray,
  currencyArray,
} from "rating-tracker-commons";

export const components: OpenAPIV3.ComponentsObject = {
  schemas: {
    Country: {
      type: "string",
      description:
        "The 2-letter ISO 3166-1 country code of the country the stock is based in.",
      enum: Array.from(countryArray),
      example: "US",
    },
    Industry: {
      type: "string",
      description: "The main industry the company operates in.",
      enum: Array.from(industryArray),
      example: "ConsumerElectronics",
    },
    Size: {
      type: "string",
      description: "The size of the company.",
      enum: Array.from(sizeArray),
      example: "Large",
    },
    Style: {
      type: "string",
      description: "The style of the stock.",
      enum: Array.from(styleArray),
      example: "Growth",
    },
    Currency: {
      type: "string",
      description:
        "The 3-letter ISO 4217 currency code of the currency the stock is traded in.",
      enum: Array.from(currencyArray),
      example: "USD",
    },
    Stock: {
      type: "object",
      description: "A stock.",
      properties: {
        ticker: {
          type: "string",
          example: "AAPL",
        },
        name: {
          type: "string",
          example: "Apple Inc.",
        },
        country: {
          $ref: "#/components/schemas/Country",
        },
        industry: {
          $ref: "#/components/schemas/Industry",
        },
        size: {
          $ref: "#/components/schemas/Size",
        },
        style: {
          $ref: "#/components/schemas/Style",
        },
        morningstarId: {
          type: "string",
          example: "0P000000GY",
        },
        morningstarLastFetch: {
          type: "string",
          format: "date-time",
          example: "2022-11-24T03:30:15.908Z",
        },
        starRating: {
          type: "integer",
          example: 3,
        },
        dividendYieldPercent: {
          type: "number",
          example: 0.62,
        },
        priceEarningRatio: {
          type: "number",
          example: 17.82,
        },
        currency: {
          $ref: "#/components/schemas/Currency",
        },
        lastClose: {
          type: "number",
          example: 148.31,
        },
        morningstarFairValue: {
          type: "number",
          example: 130.0,
        },
        marketCap: {
          type: "number",
          example: 2351000000000,
        },
        low52w: {
          type: "number",
          example: 129.04,
        },
        high52w: {
          type: "number",
          example: 182.13,
        },
      },
      required: ["ticker", "name"],
    },
    SortableAttribute: {
      type: "string",
      description: "The name of an attribute whose values can be sorted.",
      enum: Array.from(sortableAttributeArray),
      example: "name",
    },
    StockListWithCount: {
      type: "object",
      description:
        "A stock list accompanied with the total number of available stocks",
      properties: {
        stocks: {
          type: "array",
          description: "The list of requested stocks.",
          items: {
            $ref: "#/components/schemas/Stock",
          },
        },
        count: {
          type: "number",
          description: "The total number of available stocks.",
        },
      },
      required: ["stocks", "count"],
    },
    Error: {
      type: "object",
      properties: {
        message: {
          type: "string",
        },
        errors: {
          type: "string",
        },
      },
      required: ["message"],
    },
  },
};
