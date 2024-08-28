import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import Controller from "../utils/Controller";
import ErrorHelper from "../utils/error/errorHelper";

import { StatusSchema } from "./status.schema";
import type StatusService from "./status.service";

/**
 * This controller is responsible for providing a status report of the backend API and the services it depends on.
 */
class StatusController extends Controller {
  constructor(private statusService: StatusService) {
    super({ tags: ["Status API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler }).openapi(
      createRoute({
        method: "get",
        path: "",
        tags: this.tags,
        summary: "Get the status of the API",
        description: "Provides a status report of the backend API and the services it depends on.",
        responses: {
          200: {
            description: "OK: The status of the API and its services. The API is healthy.",
            content: { "application/json": { schema: StatusSchema } },
          },
          500: {
            description: "Internal Server Error: The status of the API and its services. The API is unhealthy.",
            content: { "application/json": { schema: StatusSchema } },
          },
        },
      }),
      async (c) => {
        const { healthy, services } = await this.statusService.get();
        return c.json({ status: healthy ? "healthy" : "unhealthy", services } as const, healthy ? 200 : 500);
      },
    );
  }
}

export default StatusController;
