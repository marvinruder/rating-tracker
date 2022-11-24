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
    example: "App",
  },
};

const country: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "country",
  description: "A country a stock is based in.",
  explode: false,
  allowReserved: true,
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
  allowReserved: true,
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

export {
  offset,
  count,
  sortBy,
  sortDesc,
  ticker,
  name,
  country,
  industry,
  size,
  style,
};
