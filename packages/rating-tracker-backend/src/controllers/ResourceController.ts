import { Request, Response } from "express";
import APIError from "../lib/apiError.js";
import { readResource } from "../redis/repositories/resource/resourceRepository.js";

class ResourceController {
  async get(req: Request, res: Response) {
    const resourceID = req.params[0];
    switch (resourceID.split(".").pop().toUpperCase()) {
      case "PNG":
        const resource = await readResource(resourceID);
        /* istanbul ignore next */
        res
          .setHeader("Content-Type", "image/png")
          .status(200)
          .send(Buffer.from(resource.content, "base64"));
        /* istanbul ignore next */
        break;
      default:
        throw new APIError(
          501,
          "Resources of this type cannot be fetched using this API endpoint yet."
        );
    }
  }
}

export default new ResourceController();
