import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import {
  countryArray,
  industryArray,
  sizeArray,
  styleArray,
  sortableAttributeArray,
  currencyArray,
  msciESGRatingArray,
  REGEX_PHONE_NUMBER,
} from "rating-tracker-commons";

export const components: OpenAPIV3.ComponentsObject = {
  schemas: {
    Country: {
      type: "string",
      description: "The 2-letter ISO 3166-1 country code of the country the stock is based in.",
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
      description: "The 3-letter ISO 4217 currency code of the currency the stock is traded in.",
      enum: Array.from(currencyArray),
      example: "USD",
    },
    MSCIESGRating: {
      type: "string",
      description: "The MSCI ESG rating of the stock.",
      enum: Array.from(msciESGRatingArray),
      example: "AA",
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
        isin: {
          type: "string",
          example: "US0378331005",
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
        marketScreenerId: {
          type: "string",
          example: "APPLE-INC-4849",
        },
        marketScreenerLastFetch: {
          type: "string",
          format: "date-time",
          example: "2022-11-24T03:30:15.908Z",
        },
        analystConsensus: {
          type: "number",
          example: 8.1,
        },
        analystCount: {
          type: "integer",
          example: 45,
        },
        analystTargetPrice: {
          type: "number",
          example: 172.51,
        },
        msciId: {
          type: "string",
          example: "apple-inc/IID000000002157615",
        },
        msciLastFetch: {
          type: "string",
          format: "date-time",
          example: "2022-11-24T03:30:15.908Z",
        },
        msciESGRating: {
          $ref: "#/components/schemas/MSCIESGRating",
        },
        msciTemperature: {
          type: "number",
          example: 1.7,
        },
        ric: {
          type: "string",
          example: "AAPL.O",
        },
        refinitivLastFetch: {
          type: "string",
          format: "date-time",
          example: "2022-11-24T03:30:15.908Z",
        },
        refinitivESGScore: {
          type: "integer",
          example: 80,
        },
        refinitivEmissions: {
          type: "integer",
          example: 97,
        },
        spId: {
          type: "integer",
          example: 4004205,
        },
        spLastFetch: {
          type: "string",
          format: "date-time",
          example: "2022-11-24T03:30:15.908Z",
        },
        spESGScore: {
          type: "integer",
          example: 40,
        },
        sustainalyticsId: {
          type: "string",
          example: "apple-inc/1007903183",
        },
        sustainalyticsESGRisk: {
          type: "number",
          example: 16.7,
        },
        description: {
          type: "string",
          example:
            "Apple designs a wide variety of consumer electronic devices, including smartphones (iPhone), tablets " +
            "(iPad), PCs (Mac), smartwatches (Apple Watch), AirPods, and TV boxes (Apple TV), among others. The " +
            "iPhone makes up the majority of Apple’s total revenue. In addition, Apple offers its customers a " +
            "variety of services such as Apple Music, iCloud, Apple Care, Apple TV+, Apple Arcade, Apple Card, and " +
            "Apple Pay, among others. Apple's products run internally developed software and semiconductors, and the " +
            "firm is well known for its integration of hardware, software and services. Apple's products are " +
            "distributed online as well as through company-owned stores and third-party retailers. The company " +
            "generates roughly 40% of its revenue from the Americas, with the remainder earned internationally.",
        },
      },
      required: ["ticker", "name", "country", "isin"],
    },
    SortableAttribute: {
      type: "string",
      description: "The name of an attribute whose values can be sorted.",
      enum: Array.from(sortableAttributeArray),
      example: "name",
    },
    StockListWithCount: {
      type: "object",
      description: "A stock list accompanied with the total number of available stocks",
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
    User: {
      type: "object",
      description: "A user of the application.",
      properties: {
        email: {
          type: "string",
          description: "The email address of a user, used as their ID",
          format: "email",
          example: "jane.doe@example.com",
        },
        name: {
          type: "string",
          description: "The common name of the user.",
          example: "Jane Doe",
        },
        avatar: {
          type: "string",
          description: "The base64-encoded avatar of the user.",
          format: "binary",
        },
        phone: {
          type: "string",
          pattern: REGEX_PHONE_NUMBER,
          description: "The phone number of the user, used for Signal messages.",
          example: "+491234567890",
        },
        accessRights: {
          type: "integer",
          description: "The access rights of the user, encoded as a bitfield",
          example: 1,
        },
      },
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
