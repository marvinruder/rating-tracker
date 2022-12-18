import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import * as fetch from "../../parameters/fetch.js";
import * as stock from "../../parameters/stock.js";
import { notFound, unauthorized } from "../../responses/clientError.js";
import { badGateway } from "../../responses/serverError.js";
import { accepted, noContent, okStockList } from "../../responses/success.js";

const get: OpenAPIV3.OperationObject = {
  tags: ["Fetch API"],
  operationId: "fetchSPData",
  summary: "S&P Fetch API",
  description: "Fetch information from S&P Global Sustainable1 ESG Scores",
  parameters: [
    {
      ...stock.ticker,
      description:
        "The ticker of a stock for which information is to be fetched. If not present, all stocks known to the system will be used",
    },
    fetch.detach,
    fetch.skip,
  ],
  responses: {
    "200": okStockList,
    "202": accepted,
    "204": noContent,
    "401": unauthorized,
    "404": notFound,
    "502": badGateway,
  },
};

export { get };
