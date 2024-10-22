import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  ADMINISTRATIVE_ACCESS,
  emailPreviewEndpointSuffix,
  emailTemplateArray,
  GENERAL_ACCESS,
} from "@rating-tracker/commons";

import { EMailSchema } from "../user/user.schema";
import type UserService from "../user/user.service";
import Controller from "../utils/Controller";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator } from "../utils/middlewares";

import { MessageSchema } from "./email.schema";
import type EmailService from "./email.service";

/**
 * This class is responsible for handling email-related operations.
 */
class EmailController extends Controller {
  constructor(
    private emailService: EmailService,
    private userService: UserService,
  ) {
    super({ tags: ["Email API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler })
      .openapi(
        createRoute({
          method: "post",
          path: "/{email}/{template}",
          tags: this.tags,
          summary: "Send an email to a user",
          description: "Sends an email based on a predefined template to a user.",
          middleware: [accessRightValidator(ADMINISTRATIVE_ACCESS + GENERAL_ACCESS)],
          request: { params: z.object({ email: EMailSchema, template: z.enum(emailTemplateArray) }).strict() },
          responses: {
            202: { description: "Accepted: The email was accepted for delivery by the SMTP server." },
            400: {
              description: "Bad Request: The request path is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description: "Not Found: No user with the given email address exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            501: {
              description: "Not Implemented: No SMTP server is configured.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            502: {
              description: "Bad Gateway: An error occurred while sending the email.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            504: {
              description: "Gateway Timeout: A timeout occurred while sending the email.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.emailService.sendEmail(
            await this.userService.read(c.req.valid("param").email),
            c.req.valid("param").template,
          );
          return c.body(null, 202);
        },
      )
      .openapi(
        createRoute({
          method: "get",
          path: `/{email}/{template}${emailPreviewEndpointSuffix}`,
          tags: this.tags,
          summary: "Preview an email",
          description: "Generates a preview of an email to a user based on a predefined template.",
          middleware: [accessRightValidator(ADMINISTRATIVE_ACCESS + GENERAL_ACCESS)],
          request: { params: z.object({ email: EMailSchema, template: z.enum(emailTemplateArray) }).strict() },
          responses: {
            200: {
              description: "OK: A preview of an email to a user based on a predefined template.",
              content: { "application/json": { schema: MessageSchema } },
            },
            400: {
              description: "Bad Request: The request path is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description: "Not Found: No user with the given email address exists.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            501: {
              description: "Not Implemented: No SMTP server is configured.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) =>
          c.json(
            this.emailService.getMessage(
              await this.userService.read(c.req.valid("param").email),
              c.req.valid("param").template,
            ),
            200,
          ),
      );
  }
}

export default EmailController;
