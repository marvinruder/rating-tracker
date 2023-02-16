import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types.js";
import { forbidden, unauthorized } from "../../responses/clientError.js";
import { okUserList } from "../../responses/success.js";

/**
 * Get a list of users.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["User Admin API"],
  operationId: "getUserList",
  summary: "User List API",
  description: "Get a list of users.",
  responses: {
    "200": okUserList,
    "401": unauthorized,
    "403": forbidden,
  },
};

export { get };
