import { z } from "@hono/zod-openapi";
import {
  accountAPIPath,
  accountAvatarEndpointSuffix,
  baseURL,
  REGEX_PHONE_NUMBER,
  usersAPIPath,
  usersAvatarEndpointSuffix,
} from "@rating-tracker/commons";

import { userExamples } from "../utils/examples";

/**
 * The email address of a user, used as a unique identifier.
 */
export const EMailSchema = z
  .string({ description: "The email address of a user, used as a unique identifier." })
  .email()
  .max(255)
  .openapi({ examples: userExamples.map((user) => user.email) });

/**
 * The common name of a user.
 */
export const NameSchema = z
  .string({ description: "The common name of a user." })
  .min(1)
  .max(255)
  .openapi({ examples: userExamples.map((user) => user.name) });

/**
 * A reference to the avatar of a user.
 */
export const AvatarRefSchema = z
  .string({ description: "A reference to the avatar of a user." })
  .startsWith(baseURL)
  .openapi({
    examples: [
      ...userExamples.map(
        (user) => `${baseURL}${usersAPIPath}/${encodeURIComponent(user.email)}${usersAvatarEndpointSuffix}`,
      ),
      `${baseURL}${accountAPIPath}${accountAvatarEndpointSuffix}`,
    ],
  });

/**
 * The phone number of a user, used for Signal messages.
 */
export const PhoneSchema = z
  .string({ description: "The phone number of a user, used for Signal messages." })
  .regex(new RegExp(REGEX_PHONE_NUMBER))
  .openapi({ examples: userExamples.filter((user) => user.phone !== undefined).map((user) => user.phone!) });

/**
 * The access rights of a user, encoded as a bitfield.
 */
export const AccessRightsSchema = z
  .number({ description: "The access rights of a user, encoded as a bitfield." })
  .int()
  .nonnegative()
  .max(255)
  .openapi({ examples: userExamples.map((user) => user.accessRights) });

/**
 * The subscriptions of a user to different types of messages, encoded as a bitfield.
 */
export const SubscriptionsSchema = z
  .number({ description: "The subscriptions of a user to different types of messages, encoded as a bitfield." })
  .int()
  .nonnegative()
  .max(255)
  .openapi({
    examples: userExamples.filter((user) => user.subscriptions !== undefined).map((user) => user.subscriptions!),
  });

/**
 * A user of the application.
 */
export const UserSchema = z
  .object(
    {
      email: EMailSchema,
      name: NameSchema,
      avatar: AvatarRefSchema.nullable(),
      phone: PhoneSchema.nullable(),
      accessRights: AccessRightsSchema,
      subscriptions: SubscriptionsSchema.nullable(),
    },
    { description: "A user of the application." },
  )
  .openapi("User");

/**
 * A timestamp used to invalidate the client cache. Will not be processed by the server.
 */
export const VSchema = z
  .number({ description: "A timestamp used to invalidate the client cache. Will not be processed by the server." })
  .int()
  .openapi({ examples: [0, 4, 1723743292449] });
