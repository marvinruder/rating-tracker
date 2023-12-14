import {
  countryArray,
  industryArray,
  sizeArray,
  styleArray,
  sortableAttributeArray,
  currencyArray,
  msciESGRatingArray,
  REGEX_PHONE_NUMBER,
  serviceArray,
} from "@rating-tracker/commons";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { DUMMY_SVG } from "../controllers/StocksController";

export const components: OpenAPIV3.ComponentsObject = {
  schemas: {
    Country: {
      type: "string",
      nullable: true,
      description: "The 2-letter ISO 3166-1 country code of the country the stock is based in.",
      enum: Array.from(countryArray),
      example: "US",
    },
    Industry: {
      type: "string",
      nullable: true,
      description: "The main industry the company operates in.",
      enum: [...Array.from(industryArray), null],
      example: "ConsumerElectronics",
    },
    Size: {
      type: "string",
      nullable: true,
      description: "The size of the company.",
      enum: [...Array.from(sizeArray), null],
      example: "Large",
    },
    Style: {
      type: "string",
      nullable: true,
      description: "The style of the stock.",
      enum: [...Array.from(styleArray), null],
      example: "Growth",
    },
    Currency: {
      type: "string",
      nullable: true,
      description: "The 3-letter ISO 4217 currency code of the currency the stock is traded in.",
      enum: [...Array.from(currencyArray), null],
      example: "USD",
    },
    MSCIESGRating: {
      type: "string",
      nullable: true,
      description: "The MSCI ESG rating of the stock.",
      enum: [...Array.from(msciESGRatingArray), null],
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
        morningstarID: {
          type: "string",
          nullable: true,
          example: "0P000000GY",
        },
        morningstarLastFetch: {
          type: "string",
          nullable: true,
          format: "date-time",
          example: "2022-11-24T03:30:15.908Z",
        },
        starRating: {
          type: "integer",
          nullable: true,
          example: 3,
        },
        dividendYieldPercent: {
          type: "number",
          nullable: true,
          example: 0.62,
        },
        priceEarningRatio: {
          type: "number",
          nullable: true,
          example: 17.82,
        },
        currency: {
          $ref: "#/components/schemas/Currency",
        },
        lastClose: {
          type: "number",
          nullable: true,
          example: 148.31,
        },
        morningstarFairValue: {
          type: "number",
          nullable: true,
          example: 130.0,
        },
        marketCap: {
          type: "integer",
          nullable: true,
          example: 2351000000000,
        },
        low52w: {
          type: "number",
          nullable: true,
          example: 129.04,
        },
        high52w: {
          type: "number",
          nullable: true,
          example: 182.13,
        },
        marketScreenerID: {
          type: "string",
          nullable: true,
          example: "APPLE-INC-4849",
        },
        marketScreenerLastFetch: {
          type: "string",
          nullable: true,
          format: "date-time",
          example: "2022-11-24T03:30:15.908Z",
        },
        analystConsensus: {
          type: "number",
          nullable: true,
          example: 8.1,
        },
        analystCount: {
          type: "integer",
          nullable: true,
          example: 45,
        },
        analystTargetPrice: {
          type: "number",
          nullable: true,
          example: 172.51,
        },
        msciID: {
          type: "string",
          nullable: true,
          example: "IID000000002157615",
        },
        msciLastFetch: {
          type: "string",
          nullable: true,
          format: "date-time",
          example: "2022-11-24T03:30:15.908Z",
        },
        msciESGRating: {
          $ref: "#/components/schemas/MSCIESGRating",
        },
        msciTemperature: {
          type: "number",
          nullable: true,
          example: 1.7,
        },
        ric: {
          type: "string",
          nullable: true,
          example: "AAPL.O",
        },
        refinitivLastFetch: {
          type: "string",
          nullable: true,
          format: "date-time",
          example: "2022-11-24T03:30:15.908Z",
        },
        refinitivESGScore: {
          type: "integer",
          nullable: true,
          example: 80,
        },
        refinitivEmissions: {
          type: "integer",
          nullable: true,
          example: 97,
        },
        spID: {
          type: "number",
          nullable: true,
          example: 4004205,
        },
        spLastFetch: {
          type: "string",
          nullable: true,
          format: "date-time",
          example: "2022-11-24T03:30:15.908Z",
        },
        spESGScore: {
          type: "integer",
          nullable: true,
          example: 40,
        },
        sustainalyticsID: {
          type: "string",
          nullable: true,
          example: "apple-inc/1007903183",
        },
        sustainalyticsESGRisk: {
          type: "number",
          nullable: true,
          example: 16.7,
        },
        description: {
          type: "string",
          nullable: true,
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
    WeightedStock: {
      allOf: [
        {
          $ref: "#/components/schemas/Stock",
        },
        {
          type: "object",
          properties: {
            amount: {
              type: "number",
              description: "The amount of currency associated with the stock.",
              example: 1000,
            },
          },
          required: ["amount"],
        },
      ],
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
            anyOf: [
              {
                $ref: "#/components/schemas/Stock",
              },
              {
                $ref: "#/components/schemas/WeightedStock",
              },
            ],
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
          description: "The email address of a user, used as their ID.",
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
          nullable: true,
          description: "The base64-encoded avatar of the user.",
          format: "binary",
        },
        phone: {
          type: "string",
          nullable: true,
          pattern: REGEX_PHONE_NUMBER,
          description: "The phone number of the user, used for Signal messages.",
          example: "+491234567890",
        },
        accessRights: {
          type: "integer",
          description: "The access rights of the user, encoded as a bitfield.",
          example: 1,
        },
        subscriptions: {
          type: "integer",
          nullable: true,
          description: "The subscriptions of the user to different types of messages, encoded as a bitfield.",
          example: 1,
        },
      },
    },
    Watchlist: {
      type: "object",
      description: "A named collection of stocks of a certain interest to a user.",
      properties: {
        id: {
          type: "integer",
          description: "A unique identifier of the watchlist.",
          example: 0,
        },
        name: {
          type: "string",
          description: "The name of the watchlist.",
          example: "My Watchlist",
        },
        subscribed: {
          type: "boolean",
          description: "Whether the user subscribed to updates for the watchlist’s stocks.",
          example: true,
        },
        stocks: {
          type: "array",
          description: "The list of stocks on the watchlist.",
          items: {
            $ref: "#/components/schemas/Stock",
          },
        },
      },
    },
    WatchlistSummary: {
      type: "object",
      description:
        "A named collection of stocks of a certain interest to a user. Includes only the tickers of the stocks, but " +
        "not the full stock objects themselves.",
      properties: {
        id: {
          type: "integer",
          description: "A unique identifier of the watchlist.",
          example: 0,
        },
        name: {
          type: "string",
          description: "The name of the watchlist.",
          example: "My Watchlist",
        },
        subscribed: {
          type: "boolean",
          description: "Whether the user subscribed to updates for the watchlist’s stocks.",
          example: true,
        },
        stocks: {
          type: "array",
          description: "The list of stocks on the watchlist. Includes only the tickers of the stocks",
          items: {
            type: "object",
            description: "An object containing only the ticker symbol of a stock.",
            properties: {
              ticker: {
                type: "string",
                description: "The ticker symbol of a stock.",
                example: "AAPL",
              },
            },
          },
        },
      },
    },
    Portfolio: {
      type: "object",
      description: "A named collection of stocks, each associated with an amount of a specified currency.",
      properties: {
        id: {
          type: "integer",
          description: "A unique identifier of the portfolio.",
          example: 0,
        },
        name: {
          type: "string",
          description: "The name of the portfolop.",
          example: "My Portfolio",
        },
        currency: {
          $ref: "#/components/schemas/Currency",
          description: "The currency associated with the portfolio.",
          example: "USD",
        },
        stocks: {
          type: "array",
          description: "The list of weighted stocks composing the portfolio.",
          items: {
            $ref: "#/components/schemas/WeightedStock",
          },
        },
      },
    },
    PortfolioSummary: {
      type: "object",
      description:
        "A named collection of stocks, each associated with an amount of a specified currency. Includes only the " +
        "tickers and amounts of the stocks, but not the full stock objects themselves.",
      properties: {
        id: {
          type: "integer",
          description: "A unique identifier of the portfolio.",
          example: 0,
        },
        name: {
          type: "string",
          description: "The name of the portfolop.",
          example: "My Portfolio",
        },
        currency: {
          $ref: "#/components/schemas/Currency",
          description: "The currency associated with the portfolio.",
          example: "USD",
        },
        stocks: {
          type: "array",
          description:
            "The list of stocks on the portfolio. Includes only the tickers of the stocks with their associated " +
            "amounts.",
          items: {
            type: "object",
            description: "An object containing only the ticker symbol of a stock with its associated amount.",
            properties: {
              ticker: {
                type: "string",
                description: "The ticker symbol of a stock.",
                example: "AAPL",
              },
              amount: {
                type: "number",
                description: "The amount of currency associated with a stock.",
                example: 1000,
              },
            },
          },
        },
      },
    },
    LogoBackground: {
      type: "array",
      description: "The logos of the highest rated stocks.",
      items: {
        type: "string",
        description: "The SVG logo of a stock.",
        example: DUMMY_SVG,
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
    Status: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["healthy", "unhealthy"],
        },
        services: {
          type: "object",
          properties: serviceArray.reduce((object, key) => ({ ...object, [key]: { type: "string" } }), {}),
        },
      },
      required: ["status"],
    },
  },
};
