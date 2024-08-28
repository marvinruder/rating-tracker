import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ADMINISTRATIVE_ACCESS, GENERAL_ACCESS, usersAvatarEndpointSuffix } from "@rating-tracker/commons";
import type { TypedResponse } from "hono";
import { bodyLimit } from "hono/body-limit";

import Controller from "../utils/Controller";
import ContentTooLargeError from "../utils/error/api/ContentTooLargeError";
import UnprocessableContentError from "../utils/error/api/UnprocessableContentError";
import { ErrorSchema } from "../utils/error/error.schema";
import ErrorHelper from "../utils/error/errorHelper";
import { accessRightValidator } from "../utils/middlewares";
import ValidationHelper from "../utils/validationHelper";

import {
  AccessRightsSchema,
  EMailSchema,
  NameSchema,
  PhoneSchema,
  SubscriptionsSchema,
  UserSchema,
  VSchema,
} from "./user.schema";
import type UserService from "./user.service";

/**
 * This controller is responsible for handling information of other users.
 */
class UserController extends Controller {
  constructor(private userService: UserService) {
    super({ tags: ["User API"] });
  }

  get router() {
    return new OpenAPIHono({ defaultHook: ErrorHelper.zodErrorHandler })
      .openapi(
        createRoute({
          method: "get",
          path: "",
          tags: this.tags,
          summary: "Get a list of users",
          description: "Returns a list of users.",
          middleware: [accessRightValidator(GENERAL_ACCESS + ADMINISTRATIVE_ACCESS)],
          responses: {
            200: {
              description: "OK: A list of users.",
              content: { "application/json": { schema: z.array(UserSchema) } },
            },
            401: {
              description: "Unauthorized: The user is not authenticated.",
              content: { "application/json": { schema: ErrorSchema } },
            },
            403: {
              description: "Forbidden: The user lacks the necessary access rights.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => c.json(await this.userService.readAll(), 200),
      )
      .openapi(
        createRoute({
          method: "get",
          path: "/{email}",
          tags: this.tags,
          summary: "Get a user",
          description: "Reads a single user from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS + ADMINISTRATIVE_ACCESS)],
          request: { params: z.object({ email: EMailSchema }).strict() },
          responses: {
            200: {
              description: "OK: The requested user.",
              content: { "application/json": { schema: UserSchema } },
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
          },
        }),
        async (c) => c.json(await this.userService.read(c.req.valid("param").email), 200),
      )
      .openapi(
        createRoute({
          method: "get",
          path: `/{email}${usersAvatarEndpointSuffix}`,
          tags: this.tags,
          summary: "Get the avatar of a user",
          description: "Returns the avatar of a user from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS + ADMINISTRATIVE_ACCESS)],
          request: {
            params: z.object({ email: EMailSchema }).strict(),
            query: z
              .object({ v: ValidationHelper.coerceToInteger(VSchema) })
              .partial()
              .strict(),
          },
          responses: {
            200: {
              description: "OK: The avatar of the user.",
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
              description: "Bad Request: The request path or query is invalid.",
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
              description:
                "Not Found: No user with the given email address exists, or the user does not have an avatar.",
              content: { "application/json": { schema: ErrorSchema } },
            },
          },
        }),
        async (c) => {
          const avatar = await this.userService.readAvatar(c.req.valid("param").email);
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
          path: "/{email}",
          tags: this.tags,
          summary: "Update a user",
          description: "Updates a user in the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS + ADMINISTRATIVE_ACCESS)],
          request: {
            params: z.object({ email: EMailSchema }).strict(),
            body: {
              description: "Properties to update in the user.",
              required: true,
              content: {
                "application/json": {
                  schema: z
                    .object({
                      email: EMailSchema,
                      name: NameSchema,
                      phone: PhoneSchema.nullable(),
                      accessRights: AccessRightsSchema,
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
              description: "Bad Request: The request path or body is invalid.",
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
          },
        }),
        async (c) => {
          await this.userService.update(c.req.valid("param").email, c.req.valid("json"));
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "put",
          path: `/{email}${usersAvatarEndpointSuffix}`,
          tags: this.tags,
          summary: "Create an avatar for a user",
          description: "Creates an avatar for a user in the database.",
          middleware: [
            accessRightValidator(GENERAL_ACCESS + ADMINISTRATIVE_ACCESS),
            bodyLimit({
              maxSize: 1024 * 1024,
              onError: () => {
                throw new ContentTooLargeError("The maximum allowed upload size is 1 MB");
              },
            }),
          ],
          request: {
            headers: z.object({
              "content-type": z
                .literal("image/avif", { description: "The MIME type of the avatar payload. Must be `image/avif`." })
                .openapi({ examples: ["image/avif"] }),
            }),
            params: z.object({ email: EMailSchema }).strict(),
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
              description: "Bad Request: The request path or body is invalid.",
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
          await this.userService.update(c.req.valid("param").email, {
            avatar: `data:${c.req.valid("header")["content-type"]};base64,${avatarBody}`,
          });
          return c.body(null, 201);
        },
      )
      .openapi(
        createRoute({
          method: "delete",
          path: `/{email}${usersAvatarEndpointSuffix}`,
          tags: this.tags,
          summary: "Delete the avatar of a user",
          description: "Deletes the avatar of a user from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS + ADMINISTRATIVE_ACCESS)],
          request: { params: z.object({ email: EMailSchema }).strict() },
          responses: {
            204: { description: "No Content: The avatar was removed successfully." },
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
          },
        }),
        async (c) => {
          await this.userService.update(c.req.valid("param").email, { avatar: null });
          return c.body(null, 204);
        },
      )
      .openapi(
        createRoute({
          method: "delete",
          path: "/{email}",
          tags: this.tags,
          summary: "Delete a user",
          description: "Deletes a user from the database.",
          middleware: [accessRightValidator(GENERAL_ACCESS + ADMINISTRATIVE_ACCESS)],
          request: { params: z.object({ email: EMailSchema }).strict() },
          responses: {
            204: { description: "No Content: The user was deleted successfully." },
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
          },
        }),
        async (c) => {
          await this.userService.delete(c.req.valid("param").email);
          return c.body(null, 204);
        },
      );
  }
}

export default UserController;
