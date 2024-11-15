import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GENERAL_ACCESS, accountAvatarEndpointSuffix, accountOIDCIdentitySuffix } from "@rating-tracker/commons";
import type { TypedResponse } from "hono";
import { bodyLimit } from "hono/body-limit";

import { EMailSchema, NameSchema, PhoneSchema, SubscriptionsSchema, UserSchema, VSchema } from "../user/user.schema";
import Controller from "../utils/Controller";
import ContentTooLargeError from "../utils/error/api/ContentTooLargeError";
import UnprocessableContentError from "../utils/error/api/UnprocessableContentError";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator } from "../utils/middlewares";
import ValidationHelper from "../utils/validationHelper";

import type AccountService from "./account.service";

/**
 * This controller is responsible for handling a user’s own account information.
 */
class AccountController extends Controller {
  constructor(private accountService: AccountService) {
    super({ tags: ["Account API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler })
      .openapi(
        createRoute({
          method: "get",
          path: "",
          tags: this.tags,
          summary: "Get the current user",
          description: "Returns the current user. If no user is logged in, an empty object is returned.",
          request: {},
          responses: {
            200: {
              description: "OK: The current user. If no user is logged in, an empty object is returned.",
              content: { "application/json": { schema: UserSchema.or(z.object({})) } },
            },
          },
        }),
        async (c) => {
          const user = c.get("user");
          return c.json(user?.email ? await this.accountService.read(user.email) : ({} as const), 200);
        },
      )
      .openapi(
        createRoute({
          method: "get",
          path: accountAvatarEndpointSuffix,
          tags: this.tags,
          summary: "Get the avatar of the current user",
          description: "Returns the avatar of the current user.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: {
            query: z
              .object({ v: ValidationHelper.coerceToInteger(VSchema) })
              .partial()
              .strict(),
          },
          responses: {
            200: {
              description: "OK: The avatar of the current user.",
              content: {
                "image/avif": {
                  schema: { type: "string", format: "binary", description: "The binary payload of the avatar." },
                },
                "image/jpeg": {
                  schema: { type: "string", format: "binary", description: "The binary payload of the avatar." },
                },
              },
            },
            400: {
              description: "Bad Request: The request query is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            404: {
              description: "Not Found: The user does not have an avatar.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            500: {
              description: "Internal Server Error: An error occurred while reading the avatar.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const avatar = await this.accountService.readAvatar(c.get("user")!.email);
          return c.body(avatar.buffer, 200, { "Content-Type": avatar.mimeType }) as unknown as TypedResponse<
            Buffer,
            200,
            typeof avatar.mimeType
          >;
        },
      )
      .openapi(
        createRoute({
          method: "patch",
          path: "",
          tags: this.tags,
          summary: "Update the current user",
          description: "Updates the current user in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          request: {
            body: {
              description: "Properties to update in the account.",
              required: true,
              content: {
                "application/json": {
                  schema: z
                    .object({
                      email: EMailSchema,
                      name: NameSchema,
                      phone: PhoneSchema.nullable(),
                      subscriptions: SubscriptionsSchema.nullable(),
                    })
                    .partial()
                    .strict(),
                },
              },
            },
          },
          responses: {
            204: { description: "No Content: The user was updated successfully." },
            400: {
              description: "Bad Request: The request body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          await this.accountService.update(c.get("user")!.email, c.req.valid("json"));
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "put",
          path: accountAvatarEndpointSuffix,
          tags: this.tags,
          summary: "Create an avatar for the current user",
          description: "Creates an avatar for the current user in the database.",
          middleware: [
            accessRightValidator(GENERAL_ACCESS),
            bodyLimit({
              maxSize: 1024 * 1024,
              onError: () => {
                throw new ContentTooLargeError("The maximum allowed upload size is 1 MB");
              },
            }),
          ] as const,
          request: {
            headers: z.object({
              "content-type": z
                .literal("image/avif", { description: "The MIME type of the avatar payload. Must be `image/avif`." })
                .openapi({ examples: ["image/avif"] }),
            }),
            body: {
              description: "The binary payload of the avatar.",
              required: true,
              content: {
                "image/avif": {
                  schema: { type: "string", format: "binary", description: "The binary payload of the avatar." },
                },
              },
            },
          },
          responses: {
            201: { description: "Created: The avatar was added successfully." },
            400: {
              description: "Bad Request: The request body is invalid.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            413: {
              description: "Content Too Large: The avatar exceeds the maximum size of 1 MB.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            415: {
              description: "Unsupported Media Type: The avatar is not in the correct format.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            422: {
              description: "Unprocessable Content: The avatar could not be parsed.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const avatarBody = Buffer.from(await c.req.arrayBuffer()).toString("base64");
          if (!avatarBody) throw new UnprocessableContentError("Cannot parse request body.");
          const user = c.get("user")!;
          await this.accountService.update(user.email, {
            avatar: `data:${c.req.valid("header")["content-type"]};base64,${avatarBody}`,
          });
          return c.body(null, 201);
        },
      )
      .openapi(
        createRoute({
          method: "delete",
          path: accountAvatarEndpointSuffix,
          tags: this.tags,
          summary: "Delete the avatar of the current user",
          description: "Deletes the avatar of the current user from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          responses: {
            204: { description: "No Content: The avatar was removed successfully." },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const user = c.get("user")!;
          await this.accountService.update(user.email, { avatar: null });
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "delete",
          path: accountOIDCIdentitySuffix,
          tags: this.tags,
          summary: "Delete the OpenID Connect identity of the current user",
          description: "Deletes the OpenID Connect identity from the current user in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          responses: {
            204: { description: "No Content: The OpenID Connect identity was removed successfully." },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const user = c.get("user")!;
          await this.accountService.removeOIDCIdentity(user.email);
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "delete",
          path: "",
          tags: this.tags,
          summary: "Delete the current user",
          description: "Deletes the current user from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS)] as const,
          responses: {
            204: { description: "No Content: The user was deleted successfully." },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const user = c.get("user")!;
          await this.accountService.delete(user.email);
          return c.body(null, 204);
        },
      );
  }
}

export default AccountController;
