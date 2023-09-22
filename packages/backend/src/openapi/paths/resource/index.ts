import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { notFound, unauthorized } from "../../responses/clientError";
import { notImplemented } from "../../responses/serverError";
import { ok } from "../../responses/success";

/**
 * Get the specified resource
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Resource API"],
  operationId: "getResource",
  summary: "Get Resource API",
  description: "Get the specified resource",
  parameters: [
    {
      in: "path",
      name: "id",
      description: "The ID of the resource.",
      schema: {
        type: "string",
        example: "error-morningstar-AAPL-1672314714007.png",
      },
      required: true,
    },
  ],
  responses: {
    "200": ok,
    "401": unauthorized,
    "404": notFound,
    "501": notImplemented,
  },
};

export { get };
