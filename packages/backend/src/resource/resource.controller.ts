import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { GENERAL_ACCESS } from "@rating-tracker/commons";
import type { TypedResponse } from "hono";

import Controller from "../utils/Controller";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator } from "../utils/middlewares";

import type ResourceService from "./resource.service";

/**
 * This controller is responsible for providing resources such as images or artifacts from failed fetches.
 */
class ResourceController extends Controller {
  constructor(private resourceService: ResourceService) {
    super({ tags: ["Resource API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler }).openapi(
      createRoute({
        method: "get",
        path: "/{uri}",
        tags: this.tags,
        summary: "Get a resource",
        description: "Fetches a resource from the database.",
        middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
        request: {
          params: z
            .object({
              uri: z
                .string({ description: "The ID of the resource." })
                .openapi({
                  examples: ["error-morningstar-AAPL-1672314714007.html", "error-lseg-AAPL-1672314714007.json"],
                })
                .min(1),
            })
            .strict(),
        },
        responses: {
          200: {
            description: "OK: The requested resource.",
            content: { "*/*": { schema: { description: "The payload of the resource." } } },
          },
          400: {
            description: "Bad Request: The request path is invalid.",
            content: { "application/json": { schema: ErrorSchema } },
          },
          401: {
            description: "Unauthorized: The user is not authenticated.",
            content: { "application/json": { schema: ErrorSchema } },
          },
          404: {
            description: "Not Found: No resource with the given ID exists.",
            content: { "application/json": { schema: ErrorSchema } },
          },
        },
      }),
      async (c) => {
        const resource = await this.resourceService.read(c.req.valid("param").uri);
        return c.body(resource.content, 200, { "Content-Type": resource.contentType }) as unknown as TypedResponse<
          Buffer,
          200,
          typeof resource.contentType
        >;
      },
    );
  }
}

export default ResourceController;
