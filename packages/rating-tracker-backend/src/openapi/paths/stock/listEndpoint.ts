import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import * as stock from "../../parameters/stock.js";
import { unauthorized } from "../../responses/clientError.js";
import { okStockListWithCount } from "../../responses/success.js";

const get: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "getStockList",
  summary: "Stock List API",
  description: "Get a list of stocks. Supports pagination.",
  parameters: [
    stock.offset,
    stock.count,
    stock.sortBy,
    stock.sortDesc,
    stock.name,
    stock.country,
    stock.industry,
    stock.size,
    stock.style,
    stock.msciESGRating,
    stock.msciTemperature,
  ],
  responses: {
    "200": okStockListWithCount,
    "401": unauthorized,
  },
};

export { get };
