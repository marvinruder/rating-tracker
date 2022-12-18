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
};
