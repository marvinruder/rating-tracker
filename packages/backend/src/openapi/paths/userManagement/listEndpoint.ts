import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import { forbidden, unauthorized } from "../../responses/clientError";
import { okUserList } from "../../responses/success";

/**
 * Get a list of users.
 */
const get: OpenAPIV3.OperationObject = {
  tags: ["User Management API"],
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
