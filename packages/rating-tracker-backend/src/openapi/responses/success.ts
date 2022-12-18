import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

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

const okOperational: OpenAPIV3.ResponseObject = {
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
};

const accepted: OpenAPIV3.ResponseObject = {
  description: "Accepted",
};

const created: OpenAPIV3.ResponseObject = {
  description: "Created",
};

const noContent: OpenAPIV3.ResponseObject = {
  description: "No Content",
};

export {
  okObject,
  okSVG,
  okStock,
  okStockList,
  okStockListWithCount,
  okOperational,
  accepted,
  created,
  noContent,
};
