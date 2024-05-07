import type { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { unauthorized, tooManyRequestsJSONError } from "../../responses/clientError";
import { badGateway } from "../../responses/serverError";
import { okYahooStockStubList } from "../../responses/success";

/**
 * Access the Yahoo Finance API
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Proxy API"],
  operationId: "getYahooFinance",
  summary: "Yahoo Finance Proxy API endpoint",
  description: "Access the Yahoo Finance API",
  parameters: [
    {
      name: "q",
      in: "query",
      required: true,
      schema: {
        type: "string",
      },
      description:
        "The query to be sent to the Yahoo Finance API. " +
        "Can be a ticker, an ISIN, a name or a similar identifier of a stock.",
      example: "us0378331005",
    },
  ],
  responses: {
    "200": okYahooStockStubList,
    "401": unauthorized,
    "429": tooManyRequestsJSONError,
    "502": badGateway,
  },
};

export { get };
