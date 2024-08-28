import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { TypedResponse } from "hono";

import Controller from "../utils/Controller";
import ErrorHelper from "../utils/error/errorHelper";
import ValidationHelper from "../utils/validationHelper";

import { LogoBackgroundSchema } from "./logobackground.schema";
import { LogoVariantSchema } from "./stock.schema";
import type StockService from "./stock.service";

/**
 * This controller is responsible for providing collections of stock logos for the background of the website.
 */
class LogoBackgroundController extends Controller {
  constructor(private stockService: StockService) {
    super({ tags: ["Logo Background API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler }).openapi(
      createRoute({
        method: "get",
        path: "",
        tags: this.tags,
        summary: "Get the logos of the highest rated stocks",
        description: "Fetches the logos of the highest rated stocks.",
        request: {
          query: z
            .object({
              variant: LogoVariantSchema,
              count: ValidationHelper.coerceToInteger(
                z
                  .number({ description: "How many logos to return" })
                  .int()
                  .min(1)
                  .max(50)
                  .openapi({ examples: [25, 50] }),
              ),
            })
            .strict(),
        },
        responses: {
          200: {
            description: "OK: The logos of the highest rated stocks.",
            content: { "application/json": { schema: LogoBackgroundSchema } },
          },
        },
      }),
      async (c) => {
        const logosResource = await this.stockService.readLogos(
          c.req.valid("query").count,
          c.req.valid("query").variant,
        );
        return c.body(logosResource.content, 200, {
          "Cache-Control": `max-age=${Math.trunc((logosResource.expiresAt.getTime() - Date.now()) / 1000)}`,
          "Content-Type": logosResource.contentType,
        }) as unknown as TypedResponse<z.infer<typeof LogoBackgroundSchema>, 200, "json">;
      },
    );
  }
}

export default LogoBackgroundController;
