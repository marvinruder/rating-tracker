import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as fetch from "../../parameters/fetch";
import * as stock from "../../parameters/stock";
import { forbidden, notFound, unauthorized } from "../../responses/clientError";
import { badGateway, internalServerError } from "../../responses/serverError";
import { accepted, noContent, okStockList } from "../../responses/success";

/**
 * Fetch information from Morningstar Sustainalytics
 */
const post: OpenAPIV3.OperationObject = {
  tags: ["Fetch API"],
  operationId: "fetchSustainalyticsData",
  summary: "Sustainalytics Fetch API endpoint",
  description: "Fetch information from Morningstar Sustainalytics",
  parameters: [
    {
      ...stock.ticker,
      description:
        "The ticker of a stock for which information is to be fetched. " +
        "If not present, all stocks known to the system will be used",
    },
    fetch.detach,
    fetch.clear,
  ],
  responses: {
    "200": okStockList,
    "202": accepted,
    "204": noContent,
    "401": unauthorized,
    "403": forbidden,
    "404": notFound,
    "500": internalServerError,
    "502": badGateway,
  },
};

export { post };
