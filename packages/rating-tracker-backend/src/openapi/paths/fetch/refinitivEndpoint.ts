import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import * as fetch from "../../parameters/fetch.js";
import * as stock from "../../parameters/stock.js";
import {
  notFound,
  tooManyRequestsJSONError,
  unauthorized,
} from "../../responses/clientError.js";
import { badGateway } from "../../responses/serverError.js";
import { accepted, noContent, okStockList } from "../../responses/success.js";

const get: OpenAPIV3.OperationObject = {
  tags: ["Fetch API"],
  operationId: "fetchRefinitivData",
  summary: "Refinitiv Fetch API",
  description: "Fetch information from Refinitiv ESG company scores",
  parameters: [
    {
      ...stock.ticker,
      description:
        "The ticker of a stock for which information is to be fetched. If not present, all stocks known to the system will be used",
    },
    fetch.detach,
    fetch.noSkip,
  ],
  responses: {
    "200": okStockList,
    "202": accepted,
    "204": noContent,
    "401": unauthorized,
    "404": notFound,
    "429": tooManyRequestsJSONError,
    "502": badGateway,
  },
};

export { get };
