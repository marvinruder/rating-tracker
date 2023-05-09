import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { okOperational } from "../responses/success.js";

/**
 * Returns a JSON object with the status “operational” if online.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Status API"],
  operationId: "status",
  summary: "Status API",
  description: "Returns a JSON object with the status “operational” if online.",
  responses: {
    "200": okOperational,
  },
};

export { get };
