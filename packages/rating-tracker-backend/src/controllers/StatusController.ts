import { Request, Response } from "express";
import { statusEndpointPath } from "rating-tracker-commons";
import Router from "../utils/router.js";

/**
 * This class is responsible for providing a trivial status response whenever the backend API is up and running.
 */
export class StatusController {
  /**
   * Provides a trivial status response whenever the backend API is up and running.
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: statusEndpointPath,
    method: "get",
    accessRights: 0,
  })
  get(_: Request, res: Response) {
    res.status(200).json({ status: "operational" }).end();
  }
}
