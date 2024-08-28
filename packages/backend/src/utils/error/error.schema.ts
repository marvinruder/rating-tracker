import { z } from "zod";

/**
 * An error returned by the API.
 */
export const ErrorSchema = z
  .object({ message: z.string({ description: "A description of the error." }) })
  .openapi("Error");
