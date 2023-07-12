import { Request, Response } from "express";
import { statusEndpointPath } from "@rating-tracker/commons";
import Router from "../utils/router.js";
import { redisIsReady } from "../redis/redis.js";
import { prismaIsReady } from "../db/client.js";
import { seleniumIsReady } from "../utils/webdriver.js";
import { signalIsReadyOrUnused } from "../signal/signalBase.js";

/**
 * This class is responsible for providing a trivial status response whenever the backend API is up and running.
 */
export class StatusController {
  /**
   * Provides a trivial status response whenever the backend API is up and running.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: statusEndpointPath,
    method: "get",
    accessRights: 0,
  })
  get(_: Request, res: Response) {
    Promise.all([redisIsReady(), prismaIsReady(), seleniumIsReady(), signalIsReadyOrUnused()])
      .then(() => res.status(200).json({ status: "healthy" }).end())
      .catch((e) => res.status(500).json({ status: "unhealthy", details: e.message }).end());
  }
}
