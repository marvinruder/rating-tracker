import { GENERAL_ACCESS, resourcesEndpointPath } from "@rating-tracker/commons";
import { Request, Response } from "express";

import { readResource } from "../redis/repositories/resourceRepository";
import APIError from "../utils/APIError";
import Router from "../utils/router";

/**
 * This class is responsible for providing resources such as images.
 */
export class ResourcesController {
  /**
   * Fetches a resource from Redis.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @throws an {@link APIError} if a resource of an unsupported type is requested
   */
  @Router({
    path: resourcesEndpointPath + "/:url",
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async get(req: Request, res: Response) {
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
  }
}
