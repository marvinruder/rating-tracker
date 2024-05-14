import { GENERAL_ACCESS, resourcesAPIPath } from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";

import { unauthorized, notFound } from "../openapi/responses/clientError";
import { notImplemented } from "../openapi/responses/serverError";
import { ok } from "../openapi/responses/success";
import { readResource } from "../redis/repositories/resourceRepository";
import APIError from "../utils/APIError";
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
   * @throws an {@link APIError} if a resource of an unsupported type is requested
   */
  @Endpoint({
    spec: {
      summary: "Get a resource",
      description: "Fetches a resource from the cache.",
      parameters: [
        {
          in: "path",
          name: "url",
          description: "The ID of the resource.",
          schema: { type: "string", example: "error-morningstar-AAPL-1672314714007.png" },
          required: true,
        },
      ],
      responses: { "200": ok, "401": unauthorized, "404": notFound, "501": notImplemented },
    },
    method: "get",
    path: "/{url}",
    accessRights: GENERAL_ACCESS,
  })
  get: RequestHandler = async (req: Request, res: Response) => {
    const { url } = req.params;
    // Use the file extension to determine the type of the resource
    switch (url.split(".").pop().toUpperCase()) {
      case "PNG":
        const pngResource = await readResource(url);
        // deepcode ignore XSS: parameter is sanitized by OpenAPI validator
        res.setHeader("content-type", "image/png").status(200).send(Buffer.from(pngResource.content, "base64")).end();
        break;
      case "HTML":
        const htmlResource = await readResource(url);
        // deepcode ignore XSS: parameter is sanitized by OpenAPI validator
        res.setHeader("content-type", "text/html; charset=utf-8").status(200).send(htmlResource.content).end();
        break;
      case "JSON":
        const jsonResource = await readResource(url);
        // deepcode ignore XSS: parameter is sanitized by OpenAPI validator
        res.setHeader("content-type", "application/json; charset=utf-8").status(200).send(jsonResource.content).end();
        break;
      default:
        throw new APIError(501, "Resources of this type cannot be fetched using this API endpoint yet.");
    }
  };
}

export default new ResourcesController();
