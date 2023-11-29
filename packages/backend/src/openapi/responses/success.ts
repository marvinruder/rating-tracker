import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

/**
 * A response with a 200 OK status code and an empty body.
 */
export const ok: OpenAPIV3.ResponseObject = {
  description: "OK",
};

/**
 * A response with a 200 OK status code and a generic object body.
 */
export const okObject: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        type: "object",
      },
    },
  },
};

/**
 * A response with a 200 OK status code and an SVG body.
 */
export const okSVG: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "image/svg+xml": {
      schema: {
        type: "object",
      },
    },
  },
};

/**
 * A response with a 200 OK status code and a Stock object body.
 */
export const okStock: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Stock",
      },
    },
  },
};

/**
 * A response with a 200 OK status code and an array of Stock objects.
 */
export const okStockList: OpenAPIV3.ResponseObject = {
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
};

/**
 * A response with a 200 OK status code and an object containing an array of Stock objects and a count.
 */
export const okStockListWithCount: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/StockListWithCount",
      },
    },
  },
};

/**
 * A response with a 200 OK status code and an array of User objects.
 */
export const okUserList: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        type: "array",
        items: {
          $ref: "#/components/schemas/User",
        },
      },
    },
  },
};

/**
 * A response with a 200 OK status code and a Watchlist object body.
 */
export const okWatchlist: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Watchlist",
      },
    },
  },
};

/**
 * A response with a 200 OK status code and an array of Watchlist Summary objects.
 */
export const okWatchlistSummary: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        type: "array",
        items: {
          $ref: "#/components/schemas/WatchlistSummary",
        },
      },
    },
  },
};

/**
 * A response with a 200 OK status code and a Portfolio object body.
 */
export const okPortfolio: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Portfolio",
      },
    },
  },
};

/**
 * A response with a 200 OK status code and an array of Portfolio Summary objects.
 */
export const okPortfolioSummary: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        type: "array",
        items: {
          $ref: "#/components/schemas/PortfolioSummary",
        },
      },
    },
  },
};

/**
 * A response with a 200 OK status code and an array of SVG logo strings.
 */
export const okLogoBackground: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/LogoBackground",
      },
    },
  },
};

/**
 * A response with a 200 OK status code and a Status object body.
 */
export const okHealthy: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Status",
      },
    },
  },
};

/**
 * A response with a 200 OK status code and a User object body.
 */
export const okUser: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/User",
        nullable: true,
      },
    },
  },
};

/**
 * A response with a 201 Created status code.
 */
export const created: OpenAPIV3.ResponseObject = {
  description: "Created",
};

/**
 * A response with a 201 Created status code containing the ID of the newly created watchlist.
 */
export const createdWatchlistID: OpenAPIV3.ResponseObject = {
  description: "Created with ID of new watchlist",
  content: {
    "application/json": {
      schema: {
        properties: {
          id: {
            type: "integer",
            description: "A unique identifier of the watchlist.",
            example: 0,
          },
        },
      },
    },
  },
};

/**
 * A response with a 201 Created status code containing the ID of the newly created portfolio.
 */
export const createdPortfolioID: OpenAPIV3.ResponseObject = {
  description: "Created with ID of new portfolio",
  content: {
    "application/json": {
      schema: {
        properties: {
          id: {
            type: "integer",
            description: "A unique identifier of the portfolio.",
            example: 0,
          },
        },
      },
    },
  },
};

/**
 * A response with a 202 Accepted status code.
 */
export const accepted: OpenAPIV3.ResponseObject = {
  description: "Accepted",
};

/**
 * A response with a 204 No Content status code.
 */
export const noContent: OpenAPIV3.ResponseObject = {
  description: "No Content",
};
