import APIError from "../../utils/apiError.js";
import { User, UserWithCredentials } from "rating-tracker-commons";
import chalk from "chalk";
import * as signal from "../../signal/signal.js";
import logger, { PREFIX_POSTGRES } from "../../utils/logger.js";
import client from "../client.js";

/**
 * Create a user with credentials.
 *
 * @param {UserWithCredentials} user The user to create.
 * @returns {Promise<boolean>} A promise that resolves to true if the user was created, false if it already existed.
 */
export const createUser = (user: UserWithCredentials): Promise<boolean> => {
  // Attempt to find an existing user with the same email address
  return client.user
    .findUniqueOrThrow({
      where: {
        email: user.email,
      },
    })
    .then((existingUser) => {
      // If that worked, a user with the same email address already exists
      logger.warn(
        PREFIX_POSTGRES +
          chalk.yellowBright(`Skipping user “${user.name}” – existing already (email address ${existingUser.email}).`)
      );
      return false;
    })
    .catch(async () => {
      await client.user.create({
        data: { ...user },
      });
      logger.info(PREFIX_POSTGRES + `Created user “${user.name}” with email address ${user.email}}.`);
      // Inform the admin of the new user via Signal messenger
      await signal.sendMessage(`🆕👤 New user “${user.name}” (email ${user.email}) registered.`, "userManagement");
      return true;
    });
};

/**
 * Read a user.
 *
 * @param {string} email The email address of the user.
 * @returns {Promise<User>} A promise that resolves to the user.
 * @throws an {@link APIError} if the user does not exist.
 */
export const readUser = (email: string): Promise<User> => {
  return client.user
    .findUniqueOrThrow({
      where: { email },
    })
    .then((user) => {
      return new User(user);
    })
    .catch(() => {
      throw new APIError(404, `User ${email} not found.`);
    });
};

/**
 * Read a user and include credentials.
 *
 * @param {string} email The email address of the user.
 * @returns {Promise<UserWithCredentials>} A promise that resolves to the user.
 * @throws an {@link APIError} if the user does not exist.
 */
export const readUserWithCredentials = (email: string): Promise<UserWithCredentials> => {
  return client.user
    .findUniqueOrThrow({
      where: { email },
    })
    .then((user) => {
      return new UserWithCredentials(user);
    })
    .catch(() => {
      throw new APIError(404, `User ${email} not found.`);
    });
};

/**
 * Read all users.
 *
 * @returns {Promise<User[]>} A promise that resolves to a list of all users.
 */
export const readAllUsers = (): Promise<User[]> => {
  return client.user.findMany().then((users) => users.map((user) => new User(user)));
};

/**
 * Check whether a user exists.
 *
 * @param {string} email The email address of the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the user exists, false otherwise.
 */
export const userExists = (email: string): Promise<boolean> => {
  return client.user
    .findUniqueOrThrow({ where: { email } })
    .then(() => true)
    .catch(() => false);
};

/**
 * Update a user.
 *
 * @param {string} email The email address of the user.
 * @param {Partial<Omit<UserWithCredentials, "email">>} newValues The new values for the user.
 * @throws an {@link APIError} if the user does not exist.
 */
export const updateUserWithCredentials = async (
  email: string,
  newValues: Partial<Omit<UserWithCredentials, "email">>
) => {
  let k: keyof typeof newValues; // all keys of new values
  const user = await readUserWithCredentials(email); // Read the user from the database
  logger.info(PREFIX_POSTGRES + `Updating user ${email}…`);
  let isNewData = false;
  // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
  for (k in newValues) {
    if (newValues[k] !== undefined) {
      /* istanbul ignore next -- @preserve */ // Those properties are always caught by OpenAPI validation
      if (user[k] === undefined) {
        throw new APIError(400, `Invalid property ${k} for user ${user.email}.`);
      }
      if (newValues[k] === user[k]) {
        delete newValues[k];
        continue;
      }

      // New data is different from old data
      isNewData = true;

      logger.info(PREFIX_POSTGRES + `    Property ${k} updated from ${user[k]} to ${newValues[k]}`);
    }
  }

  if (isNewData) {
    await client.user.update({
      where: {
        email: user.email,
      },
      data: { ...newValues },
    });
  } else {
    // No new data was provided
    logger.info(PREFIX_POSTGRES + `No updates for user ${email}.`);
  }
};

/**
 * Delete a user.
 *
 * @param {string} email The email address of the user to delete.
 * @throws an {@link APIError} if the user does not exist.
 */
export const deleteUser = async (email: string) => {
  // Attempt to find a user with the given email address
  try {
    const existingUser = await client.user.findUniqueOrThrow({ where: { email } });
    // If that worked, we can delete the existing user
    await client.user.delete({
      where: { email },
    });
    logger.info(PREFIX_POSTGRES + `Deleted user “${existingUser.name}” (email address ${email}).`);
  } catch {
    throw new APIError(404, `User ${email} not found.`);
  }
};
