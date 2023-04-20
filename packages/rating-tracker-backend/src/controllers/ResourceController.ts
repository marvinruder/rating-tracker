import { Request, Response } from "express";
import APIError from "../utils/apiError.js";
import { readResource } from "../redis/repositories/resourceRepository.js";
import { GENERAL_ACCESS, resourceEndpointPath } from "rating-tracker-commons";
import Router from "../utils/router.js";

/**
 * This class is responsible for providing resources such as images.
 */
export class ResourceController {
  /**
   * Fetches a resource from Redis.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @throws an {@link APIError} if a resource of an unsupported type is requested
   */
  @Router({
    path: resourceEndpointPath + "/*",
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async get(req: Request, res: Response) {
    const resourceID = req.params[0];
    // Use the file extension to determine the type of the resource
    switch (resourceID.split(".").pop().toUpperCase()) {
      case "PNG":
        const resource = await readResource(resourceID);
        res.setHeader("Content-Type", "image/png").status(200).send(Buffer.from(resource.content, "base64")).end();
        break;
      default:
        throw new APIError(501, "Resources of this type cannot be fetched using this API endpoint yet.");
    }
  }
}
