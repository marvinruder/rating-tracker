import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";

import { internalServerErrorServerUnhealthy } from "../responses/serverError";
import { okHealthy } from "../responses/success";

/**
 * Returns a JSON object with the status “healthy” if online and able to connect to all services, or “unhealthy”
 * otherwise.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["Status API"],
  operationId: "status",
  summary: "Read Status API endpoint",
  description:
    "Returns a JSON object with the status “healthy” if online and able to connect to all services, or " +
    "“unhealthy” otherwise.",
  responses: {
    "200": okHealthy,
    "500": internalServerErrorServerUnhealthy,
  },
};

export { get };
