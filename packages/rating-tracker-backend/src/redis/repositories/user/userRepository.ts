import APIError from "../../../lib/apiError.js";
import { User, UserEntity, userSchema } from "../../../models/user.js";
import { fetch, remove, save } from "./userRepositoryBase.js";
import chalk from "chalk";
import * as signal from "../../../signal/signal.js";
import logger, { PREFIX_REDIS } from "../../../lib/logger.js";

/**
 * Create a user.
 *
 * @param {User} user The user to create.
 * @returns {boolean} Whether the user was created.
 */
/* istanbul ignore next */ // Since we cannot yet test the authentication process, we cannot create a valid User
export const createUser = async (user: User): Promise<boolean> => {
  const existingUser = await fetch(user.email); // Attempt to fetch an existing user with the same email address
  if (existingUser && existingUser.name) {
    // If that worked, a user with the same email address already exists
    logger.warn(
      PREFIX_REDIS +
        chalk.yellowBright(
          `Skipping user “${user.name}” – existing already (entity ID ${existingUser.entityId}).`
        )
    );
    return false;
  }
  const userEntity = new UserEntity(userSchema, user.email, {
    ...user,
  });
  logger.info(
    PREFIX_REDIS +
      `Created user “${user.name}” with entity ID ${await save(userEntity)}.`
  );
  // Inform the admin of the new user via Signal messenger
  signal.sendMessage(
    `🆕👤 New user “${user.name}” (email ${user.email}) registered.`
  );
  return true;
};

/**
 * Read a user.
 *
 * @param {string} email The email address of the user.
 * @returns {User} The user.
 * @throws an {@link APIError} if the user does not exist.
 */
export const readUser = async (email: string) => {
  const userEntity = await fetch(email);
  if (userEntity && userEntity.name) {
    return new User(userEntity);
  }
  /* istanbul ignore next */
  throw new APIError(404, `User ${email} not found.`);
};

/**
 * Check whether a user exists.
 *
 * @param {string} email The email address of the user.
 * @returns {boolean} Whether the user exists.
 */
export const userExists = async (email: string): Promise<boolean> => {
  const userEntity = await fetch(email);
  if (userEntity && userEntity.name) {
    return true;
  }
  return false;
};

/**
 * Update a user.
 *
 * @param {string} email The email address of the user.
 * @param {Partial<Omit<User, "email">>} newValues The new values for the user.
 * @throws an {@link APIError} if the user does not exist.
 */
/* istanbul ignore next */ // This is only called after an authentication, which we cannot yet test
export const updateUser = async (
  email: string,
  newValues: Partial<Omit<User, "email">>
) => {
  let k: keyof typeof newValues; // all keys of new values
  const userEntity = await fetch(email); // Fetch the user from Redis
  if (userEntity && userEntity.name) {
    logger.info(PREFIX_REDIS + `Updating user ${email}…`);
    let isNewData = false;
    // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
    for (k in newValues) {
      if (k in newValues && newValues[k]) {
        if (newValues[k] !== userEntity[k]) {
          // New data is different from old data
          isNewData = true;
          logger.info(
            PREFIX_REDIS +
              `    Property ${k} updated from ${userEntity[k]} to ${newValues[k]}`
          );
          switch (k) {
            case "name":
            case "avatar":
            case "phone":
            case "credentialID":
            case "credentialPublicKey":
              userEntity[k] = newValues[k];
              break;
            case "accessRights":
            // deepcode ignore DuplicateCaseBody: Reassignment must happen per type
            case "counter":
              userEntity[k] = newValues[k];
              break;
            // default:
            //   userEntity[k] = newValues[k];
            //   break;
          }
        }
      }
    }
    if (isNewData) {
      await save(userEntity);
    } else {
      // No new data was provided
      logger.info(PREFIX_REDIS + `No updates for user ${email}.`);
    }
  } else {
    throw new APIError(404, `User ${email} not found.`);
  }
};

/**
 * Delete a user.
 *
 * @param {string} email The email address of the user.
 * @throws an {@link APIError} if the user does not exist.
 */
export const deleteUser = async (email: string) => {
  const userEntity = await fetch(email);
  if (userEntity && userEntity.name) {
    const name = new User(userEntity).name;
    await remove(userEntity.entityId);
    logger.info(PREFIX_REDIS + `Deleted user “${name}” (email ${email}).`);
  }
  /* istanbul ignore next */ // Not reached in current tests since a user can only delete themself
  else {
    /* istanbul ignore next */ // Not reached in current tests since a user can only delete themself
    throw new APIError(404, `User ${email} not found.`);
  }
};
