import type { Service } from "@rating-tracker/commons";
import { serviceArray, statusEndpointPath } from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";

import { prismaIsReady } from "../db/client";
import { internalServerErrorServerUnhealthy } from "../openapi/responses/serverError";
import { okHealthy } from "../openapi/responses/success";
import { redisIsReady } from "../redis/redis";
import { signalIsReadyOrUnused } from "../signal/signalBase";
import Endpoint from "../utils/Endpoint";
import Singleton from "../utils/Singleton";

/**
 * This class is responsible for providing a status report of the backend API and the services it depends on.
 */
class StatusController extends Singleton {
  /**
   * Provides a status report of the backend API and the services it depends on.
   * @param _ The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Status API"],
      operationId: "status",
      summary: "Get the status of the API",
      description: "Provides a status report of the backend API and the services it depends on.",
      responses: { "200": okHealthy, "500": internalServerErrorServerUnhealthy },
    },
    method: "get",
    path: statusEndpointPath,
    accessRights: 0,
  })
  get: RequestHandler = async (_: Request, res: Response) => {
    let healthy = true;
    const services: Partial<Record<Service, string>> = {};
    (
      await Promise.allSettled([
        // The order is important here and must match the order in `serviceArray`.
        prismaIsReady(),
        redisIsReady(),
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
  };
}

export default new StatusController();
