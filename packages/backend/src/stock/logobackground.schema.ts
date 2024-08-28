import { z } from "zod";

import { LogoSchema } from "./stock.schema";

/**
 * The logos of the highest rated stocks.
 */
export const LogoBackgroundSchema = z
  .array(LogoSchema, { description: "The logos of the highest rated stocks." })
  .openapi("LogoBackground");
