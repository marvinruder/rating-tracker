import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { badGateway } from "../../../responses/serverError";
import { okLogoBackground } from "../../../responses/success";

/**
 * Get the logos of the highest rated stocks
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Stock API"],
  operationId: "getStockLogoBackground",
  summary: "Get Stock Logo Background API",
  description: "Get the logos of the highest rated stocks",
  parameters: [
    {
      in: "query",
      name: "dark",
      description: "Whether to return logos for dark background",
      schema: {
        type: "boolean",
        example: true,
      },
    },
  ],
  responses: {
    "200": okLogoBackground,
    "502": badGateway,
  },
};

export { get };
