import { z } from "@hono/zod-openapi";

/**
 * An email message.
 */
export const MessageSchema = z
  .object(
    {
      from: z.string({ description: "The name and email address of the sender." }).min(1),
      to: z.string({ description: "The name and email address of the recipient." }).min(1),
      subject: z.string({ description: "The subject of the email." }).min(1),
      text: z.string({ description: "The text content of the email." }).nullable(),
    },
    { description: "An email message." },
  )
  .openapi("EmailMessage");
