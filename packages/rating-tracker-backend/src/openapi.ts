import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import {
  countryArray,
  industryArray,
  sizeArray,
  sortableAttributeArray,
  styleArray,
} from "./types.js";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

const servers = [
  {
    url: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
    description: "via HTTPS",
  },
];

/* istanbul ignore next */
process.env.NODE_ENV === "dev" &&
  servers.push({
    url: `http://localhost:${process.env.PORT}/`,
    description: "Local server",
  });

export const openapiDocument: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Rating Tracker Backend",
    version: "0.1.0",
    contact: {
      name: "Marvin A. Ruder",
      email: "info@mruder.dev",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
    description: "Specification JSONs: [v3](/api-spec/v3).",
  },
  servers: servers,
  paths: {
    "/api/auth/register": {
      get: {
        tags: ["Authentication API"],
        operationId: "getRegistrationOptions",
        summary: "Get Registration Options API",
        description:
          "Get information required for registering a new user via WebAuthn standard",
        parameters: [
          {
            in: "query",
            name: "email",
            description: "The email address of the new user, used as their ID",
            required: true,
            allowReserved: true,
            schema: {
              type: "string",
              example: "jane.doe@example.com",
            },
          },
          {
            in: "query",
            name: "name",
            description: "The common name of the new user",
            required: true,
            allowReserved: true,
            schema: {
              type: "string",
              example: "Jane Doe",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
          "400": {
            description: "Bad Request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "429": {
            description: "Too Many Requests",
            content: {
              "text/html": {},
            },
          },
        },
      },
      post: {
        tags: ["Authentication API"],
        operationId: "postRegistrationResponse",
        summary: "Post Registration Response API",
        description:
          "Post the response for the WebAuthn registration challenge",
        parameters: [
          {
            in: "query",
            name: "email",
            description: "The email address of the new user, used as their ID",
            required: true,
            allowReserved: true,
            schema: {
              type: "string",
              example: "jane.doe@example.com",
            },
          },
          {
            in: "query",
            name: "name",
            description: "The common name of the new user",
            required: true,
            allowReserved: true,
            schema: {
              type: "string",
              example: "Jane Doe",
            },
          },
        ],
        responses: {
          "201": {
            description: "Created",
          },
          "400": {
            description: "Bad Request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "429": {
            description: "Too Many Requests",
            content: {
              "text/html": {},
            },
          },
        },
      },
    },
    "/api/auth/signIn": {
      get: {
        tags: ["Authentication API"],
        operationId: "getAuthenticationOptions",
        summary: "Get Authentication Options API",
        description:
          "Get information required for authenticating as a registered user via WebAuthn standard",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
          "400": {
            description: "Bad Request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "429": {
            description: "Too Many Requests",
            content: {
              "text/html": {},
            },
          },
        },
      },
      post: {
        tags: ["Authentication API"],
        operationId: "postAuthenticationResponse",
        summary: "Post Authentication Response API",
        description:
          "Post the response for the WebAuthn authentication challenge",
        responses: {
          "204": {
            description: "No Content",
          },
          "400": {
            description: "Bad Request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "429": {
            description: "Too Many Requests",
            content: {
              "text/html": {},
            },
          },
        },
      },
    },
    "/api/stock/list": {
      get: {
        tags: ["Stock API"],
        operationId: "getStockList",
        summary: "Stock List API",
        description: "Get a list of stocks. Supports pagination.",
        parameters: [
          {
            in: "query",
            name: "offset",
            description: "The zero-based offset. Used for pagination.",
            required: false,
            schema: {
              type: "number",
              example: 0,
            },
          },
          {
            in: "query",
            name: "count",
            description:
              "The number of entities to be returned. If omitted, all entities known to the service will be returned (maximum: 10000).",
            required: false,
            schema: {
              type: "number",
              example: 5,
            },
          },
          {
            in: "query",
            name: "sortBy",
            description: "A parameter by which the stock list is to be sorted.",
            required: false,
            schema: {
              $ref: "#/components/schemas/SortableAttribute",
            },
          },
          {
            in: "query",
            name: "sortDesc",
            description: "Whether to sort descending.",
            required: false,
            schema: {
              type: "boolean",
            },
          },
          {
            in: "query",
            name: "name",
            description:
              "A string to be searched for in the name of the stock(s).",
            required: false,
            schema: {
              type: "string",
              example: "App",
            },
          },
          {
            in: "query",
            name: "country",
            description: "A list of countries used for searching.",
            required: false,
            explode: false,
            allowReserved: true,
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Country",
              },
            },
          },
          {
            in: "query",
            name: "industry",
            description: "A list of industries used for searching.",
            required: false,
            explode: false,
            allowReserved: true,
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Industry",
              },
            },
          },
          {
            in: "query",
            name: "size",
            description: "A list of sizes used for searching.",
            required: false,
            schema: {
              $ref: "#/components/schemas/Size",
            },
          },
          {
            in: "query",
            name: "style",
            description: "A list of styles used for searching.",
            required: false,
            schema: {
              $ref: "#/components/schemas/Style",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StockListWithCount",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/stock/fillWithExampleData": {
      put: {
        tags: ["Stock API"],
        operationId: "putExampleStocks",
        summary: "Stock Example Data API",
        description: "Fills the connected data service with example stocks",
        responses: {
          "201": {
            description: "Created",
            content: {},
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/stock/{ticker}": {
      delete: {
        tags: ["Stock API"],
        operationId: "deleteStock",
        summary: "Delete Stock API",
        description: "Delete the specified stock",
        parameters: [
          {
            in: "path",
            name: "ticker",
            description: "The ticker symbol of the stock to be deleted.",
            required: true,
            schema: {
              type: "string",
              example: "AAPL",
            },
          },
        ],
        responses: {
          "204": {
            description: "No Content",
            content: {},
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "404": {
            description: "Stock not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/fetch/morningstar": {
      get: {
        tags: ["Fetch API"],
        operationId: "fetchMorningstarData",
        summary: "Morningstar Fetch API",
        description: "Fetch information from Morningstar UK web page",
        parameters: [
          {
            in: "query",
            name: "ticker",
            description:
              "The ticker of the stock for which information is to be fetched. If not present, all stocks known to the system will be used",
            required: false,
            schema: {
              type: "string",
              example: "AAPL",
            },
          },
          {
            in: "query",
            name: "detach",
            description:
              "Whether to immediately respond to the request and detach the fetch process from it",
            required: false,
            schema: {
              type: "boolean",
              example: "false",
            },
          },
          {
            in: "query",
            name: "noSkip",
            description:
              "Whether not to skip fetching date due to a recent successful fetch",
            required: false,
            schema: {
              type: "boolean",
              example: "false",
            },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Stock",
                  },
                },
              },
            },
          },
          "202": {
            description: "Accepted",
            content: {},
          },
          "204": {
            description: "No Content",
            content: {},
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "404": {
            description: "Stock not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          "502": {
            description: "Unable to fetch",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/status": {
      get: {
        tags: ["Status API"],
        operationId: "status",
        summary: "Status API",
        description:
          "Returns a JSON object with the status “operational” if online.",
        responses: {
          "200": {
            description: "operational",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                    },
                  },
                  required: ["status"],
                },
              },
            },
          },
        },
      },
    },
    "/api/session": {
      head: {
        tags: ["Session API"],
        operationId: "session",
        summary: "Session API",
        description:
          "Returns a 2XX response code if the authentication token cookie is still valid, and a 4XX response code otherwise.",
        responses: {
          "204": {
            description: "No Content",
            content: {},
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [],
  components: {
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
  },
};

export default openapiDocument;
