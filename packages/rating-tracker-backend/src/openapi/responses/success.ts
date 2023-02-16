import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

/**
 * A response with a 200 OK status code and an empty body.
 */
const ok: OpenAPIV3.ResponseObject = {
  description: "OK",
};

/**
 * A response with a 200 OK status code and a generic object body.
 */
const okObject: OpenAPIV3.ResponseObject = {
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
const okSVG: OpenAPIV3.ResponseObject = {
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
const okStock: OpenAPIV3.ResponseObject = {
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
const okStockList: OpenAPIV3.ResponseObject = {
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
 * A response with a 200 OK status code and an array of User objects.
 */
const okUserList: OpenAPIV3.ResponseObject = {
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
 * A response with a 200 OK status code and an object containing an array of Stock objects and a count.
 */
const okStockListWithCount: OpenAPIV3.ResponseObject = {
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
 * A response with a 200 OK status code and an object containing a status string.
 */
const okOperational: OpenAPIV3.ResponseObject = {
  description: "OK",
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
};

/**
 * A response with a 200 OK status code and a User object body.
 */
const okUser: OpenAPIV3.ResponseObject = {
  description: "OK",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/User",
      },
    },
  },
};

/**
 * A response with a 201 Created status code.
 */
const created: OpenAPIV3.ResponseObject = {
  description: "Created",
};

/**
 * A response with a 202 Accepted status code.
 */
const accepted: OpenAPIV3.ResponseObject = {
  description: "Accepted",
};

/**
 * A response with a 204 No Content status code.
 */
const noContent: OpenAPIV3.ResponseObject = {
  description: "No Content",
};

export {
  ok,
  okObject,
  okSVG,
  okStock,
  okStockList,
  okUserList,
  okStockListWithCount,
  okOperational,
  okUser,
  accepted,
  created,
  noContent,
};
