import { Request, Response } from "express";
import { GENERAL_ACCESS, sessionEndpointPath } from "@rating-tracker/commons";
import { deleteSession } from "../redis/repositories/sessionRepository";
import Router from "../utils/router";

/**
 * This class is responsible for handling session information.
 */
export class SessionController {
  /**
   * Provides information regarding the authentication status.
   * If not authenticated, a 401 response would have been returned before this method is reached here.
   * If authenticated, this method is reached and a 204 response is returned.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: sessionEndpointPath,
    method: "head",
    accessRights: GENERAL_ACCESS,
  })
  head(_: Request, res: Response) {
    res.status(204).end();
  }

  /**
   * Deletes the current session from Redis and clears the session cookie.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: sessionEndpointPath,
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async delete(req: Request, res: Response) {
    await deleteSession(req.cookies.authToken);
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development", // allow plain HTTP in development
      sameSite: true,
    }); // Clears the session cookie.
    res.status(204).end();
  }
}
