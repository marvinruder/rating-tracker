import { GENERAL_ACCESS, resourcesAPIPath } from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";

import { readResource } from "../db/tables/resourceTable";
import { unauthorized, notFound } from "../openapi/responses/clientError";
import { notImplemented } from "../openapi/responses/serverError";
import { ok } from "../openapi/responses/success";
import Endpoint from "../utils/Endpoint";

import SingletonController from "./SingletonController";

/**
 * This class is responsible for providing resources such as images.
 */
class ResourcesController extends SingletonController {
  path = resourcesAPIPath;
  tags = ["Resources API"];

  /**
   * Fetches a resource from the cache.
   * @param req Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      summary: "Get a resource",
      description: "Fetches a resource from the cache.",
      parameters: [
        {
          in: "path",
          name: "uri",
          description: "The ID of the resource.",
          schema: { type: "string", example: "error-morningstar-AAPL-1672314714007.png" },
          required: true,
        },
      ],
      responses: { "200": ok, "401": unauthorized, "404": notFound, "501": notImplemented },
    },
    method: "get",
    path: "/{uri}",
    accessRights: GENERAL_ACCESS,
  })
  get: RequestHandler = async (req: Request, res: Response) => {
    const { uri } = req.params;
    const resource = await readResource(uri);
    res.setHeader("content-type", resource.contentType).status(200).send(resource.content).end();
  };
}

export default new ResourcesController();
