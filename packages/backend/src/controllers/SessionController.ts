import { GENERAL_ACCESS, sessionAPIPath } from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";

import { deleteSession } from "../db/tables/sessionTable";
import { notFound, unauthorized } from "../openapi/responses/clientError";
import { noContent } from "../openapi/responses/success";
import Endpoint from "../utils/Endpoint";

import SingletonController from "./SingletonController";

/**
 * This class is responsible for handling session information.
 */
class SessionController extends SingletonController {
  path = sessionAPIPath;
  tags = ["Session API"];

  /**
   * Provides information regarding the authentication status.
   * If not authenticated, a 401 response would have been returned before this method is reached here.
   * If authenticated, this method is reached and a 204 response is returned.
   * @param _ The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      summary: "Get the current authentication status",
      description:
        "Provides information regarding the authentication status. " +
        "Returns a 2XX response code if the authentication token cookie is still valid, " +
        "and a 4XX response code otherwise.",
      responses: { "204": noContent, "401": unauthorized },
    },
    method: "head",
    path: "",
    accessRights: GENERAL_ACCESS,
  })
  head: RequestHandler = (_: Request, res: Response) => {
    res.status(204).end();
  };

  /**
   * Deletes the current session from the cache and clears the session cookie.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      summary: "Delete the current session",
      description: "Deletes the current session from the cache and clears the session cookie.",
      responses: { "204": noContent, "401": unauthorized, "404": notFound },
    },
    method: "delete",
    path: "",
    accessRights: GENERAL_ACCESS,
  })
  delete: RequestHandler = async (req: Request, res: Response) => {
    await deleteSession(req.cookies.id);
    res.clearCookie("id", { httpOnly: true, secure: true, sameSite: true }); // Clears the session cookie.
    res.status(204).end();
  };
}

export default new SessionController();
