import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import * as fetch from "../../parameters/fetch";
import * as stock from "../../parameters/stock";
import { forbidden, notFound, unauthorized } from "../../responses/clientError";
import { badGateway } from "../../responses/serverError";
import { accepted, noContent, okStockList } from "../../responses/success";

/**
 * Fetch information from Morningstar Italy web page
 */
const post: OpenAPIV3.OperationObject = {
  tags: ["Fetch API"],
  operationId: "fetchMorningstarData",
  summary: "Morningstar Fetch API endpoint",
  description: "Fetch information from Morningstar Italy web page",
  parameters: [
    {
      ...stock.ticker,
      description:
        "The ticker of a stock for which information is to be fetched. " +
        "If not present, all stocks known to the system will be used",
    },
    fetch.detach,
    fetch.noSkip,
    fetch.clear,
    fetch.concurrency,
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
