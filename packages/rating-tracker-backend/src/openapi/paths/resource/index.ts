import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { notFound, unauthorized } from "../../responses/clientError.js";
import { notImplemented } from "../../responses/serverError.js";
import { ok } from "../../responses/success.js";

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
