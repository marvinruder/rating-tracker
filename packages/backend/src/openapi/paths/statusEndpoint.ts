import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { okHealthy } from "../responses/success.js";
import { internalServerErrorServerUnhealthy } from "../responses/serverError.js";

/**
 * Returns a JSON object with the status “healthy” if online and able to connect to all services, or “unhealthy”
 * otherwise.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Status API"],
  operationId: "status",
  summary: "Status API",
  description:
    "Returns a JSON object with the status “healthy” if online and able to connect to all services, or " +
    "“unhealthy” otherwise.",
  responses: {
    "200": okHealthy,
    "500": internalServerErrorServerUnhealthy,
  },
};

export { get };
