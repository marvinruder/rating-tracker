import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import * as fetch from "../../parameters/fetch.js";
import * as stock from "../../parameters/stock.js";
import { forbidden, notFound, unauthorized } from "../../responses/clientError.js";
import { badGateway } from "../../responses/serverError.js";
import { accepted, noContent, okStockList } from "../../responses/success.js";

/**
 * Fetch information from MSCI ESG Ratings & Climate Search Tool
 */
const post: OpenAPIV3.OperationObject = {
  tags: ["Fetch API"],
  operationId: "fetchMSCIData",
  summary: "MSCI Fetch API",
  description: "Fetch information from MSCI ESG Ratings & Climate Search Tool",
  parameters: [
    {
      ...stock.ticker,
      description:
        "The ticker of a stock for which information is to be fetched. " +
        "If not present, all stocks known to the system will be used",
    },
    fetch.detach,
    fetch.noSkip,
  ],
  responses: {
    "200": okStockList,
    "202": accepted,
    "204": noContent,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
    "502": badGateway,
  },
};

export { post };
