import { Service, serviceArray, statusEndpointPath } from "@rating-tracker/commons";
import { Request, Response } from "express";

import { prismaIsReady } from "../db/client";
import { redisIsReady } from "../redis/redis";
import { signalIsReadyOrUnused } from "../signal/signalBase";
import Router from "../utils/router";
// import { seleniumIsReady } from "../utils/webdriver";

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
  async get(_: Request, res: Response) {
    let healthy = true;
    const services: Partial<Record<Service, string>> = {};
    (
      await Promise.allSettled([
        // The order is important here and must match the order in `serviceArray`.
        prismaIsReady(),
        redisIsReady(),
        // seleniumIsReady(),
        signalIsReadyOrUnused(),
      ])
    ).forEach((result, index) => {
      if (result.status === "rejected") {
        healthy = false;
        services[serviceArray[index]] = result.reason.message;
      } else if (result.value) services[serviceArray[index]] = result.value;
    });
    res
      .status(healthy ? 200 : 500)
      .json({ status: healthy ? "healthy" : "unhealthy", services })
      .end();
  }
}
