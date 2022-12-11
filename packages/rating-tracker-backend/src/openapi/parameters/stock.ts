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
    example: "Apple Inc.",
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

const msciId: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciId",
  description: "The identifier of a stock used by MSCI",
  schema: {
    type: "string",
    example: "apple-inc/IID000000002157615",
  },
};

const msciESGRating: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciESGRating",
  description: "The MSCI ESG rating of a stock.",
  schema: {
    $ref: "#/components/schemas/MSCIESGRating",
  },
};

const msciTemperature: OpenAPIV3.ParameterObject = {
  in: "query",
  name: "msciTemperature",
  description: "The MSCI Implied Temperature Rise of a stock.",
  schema: {
    type: "number",
    example: 1.7,
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
  morningstarId,
  msciId,
  msciESGRating,
  msciTemperature,
};
