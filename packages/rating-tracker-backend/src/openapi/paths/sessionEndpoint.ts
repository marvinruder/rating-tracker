import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";

const head: OpenAPIV3.OperationObject = {
  tags: ["Session API"],
  operationId: "session",
  summary: "Session API",
  description:
    "Returns a 2XX response code if the authentication token cookie is still valid, and a 4XX response code otherwise.",
  responses: {
    "204": {
      description: "No Content",
      content: {},
    },
    "401": {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Error",
          },
        },
      },
    },
  },
};

export { head };
