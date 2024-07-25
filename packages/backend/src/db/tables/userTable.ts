import type { WebAuthnCredential } from "@rating-tracker/commons";
import { User } from "@rating-tracker/commons";

import * as signal from "../../signal/signal";
import APIError from "../../utils/APIError";
import logger from "../../utils/logger";
import client from "../client";

/**
 * Create a user with WebAuthn credentials.
 * @param user The user to create.
 * @param credential The WebAuthn credential of the user.
 * @returns Whether the user was created or existed already.
 */
export const createUser = async (user: User, credential: WebAuthnCredential): Promise<boolean> => {
  // Attempt to find an existing user with the same email address
  try {
    const existingUser = await client.user.findUniqueOrThrow({ where: { email: user.email } });
    // If that worked, a user with the same email address already exists
    logger.warn(
      { prefix: "postgres" },
      `Skipping user “${user.name}” – existing already (email address ${existingUser.email}).`,
    );
    return false;
  } catch {
    await client.user.create({
      data: {
        ...user,
        webAuthnCredentials: {
          create: {
            id: Buffer.from(credential.id),
            publicKey: Buffer.from(credential.publicKey),
            counter: credential.counter,
          },
        },
      },
    });
    logger.info({ prefix: "postgres" }, `Created user “${user.name}” with email address ${user.email}.`);
    // Inform the admin of the new user via Signal messenger
    await signal.sendMessage(`🆕👤 New user “${user.name}” (email ${user.email}) registered.`, "userManagement");
    return true;
  }
};

/**
 * Read a user.
 * @param email The email address of the user.
 * @returns The user.
 * @throws an {@link APIError} if the user does not exist.
 */
export const readUser = async (email: string): Promise<User> => {
  try {
    const user = await client.user.findUniqueOrThrow({ where: { email } });
    return new User(user);
  } catch {
    throw new APIError(404, `User ${email} not found.`);
  }
};

/**
 * Read the avatar of a user.
 * @param email The email address of the user.
 * @returns The avatar of the user.
 * @throws an {@link APIError} if the user does not exist or does not have an avatar.
 */
export const readUserAvatar = async (email: string): Promise<{ mimeType: string; buffer: Buffer }> => {
  const user = await readUser(email);
  if (user.avatar) {
    const dataURLMatcher = /^data:(?<mimeType>\w+\/\w+)(;charset=.+)?;base64,(?<data>.*)$/;
    const match = user.avatar.match(dataURLMatcher);
    if (match.groups.mimeType && match.groups.data)
      return { mimeType: match.groups.mimeType, buffer: Buffer.from(match.groups.data, "base64") };
    /* c8 ignore start */ // We do not expect data of any other format to be stored in the database
    throw new APIError(500, `Error while reading avatar of user ${email}.`);
  }
  /* c8 ignore stop */
  throw new APIError(404, `User ${email} does not have an avatar.`);
};

/**
 * Read a user, identified by their credential ID, and include credentials.
 * @param credentialID The base64url-encoded ID of the credential of the user.
 * @returns The user.
 * @throws an {@link APIError} if the user does not exist.
 */
export const readCredentialWithUser = async (credentialID: string): Promise<WebAuthnCredential & { user: User }> => {
  // Decode base64url (as specified in https://www.w3.org/TR/webauthn-2/)
  const credentialIDBuffer = Buffer.from(credentialID, "base64url");
  try {
    const credential = await client.webAuthnCredential.findUniqueOrThrow({
      where: { id: credentialIDBuffer },
      select: { id: true, publicKey: true, counter: true, user: true },
    });
    return { ...credential, user: new User(credential.user) };
  } catch {
    throw new APIError(404, `User with credential ${credentialID} not found.`);
  }
};

/**
 * Read all users.
 * @returns A list of all users.
 */
export const readAllUsers = async (): Promise<User[]> => {
  return (await client.user.findMany()).map((user) => new User(user));
};

/**
 * Read all users having at least one watchlist they subscribed to containing the given stock.
 * @param ticker The ticker of the stock.
 * @returns The users in question.
 */
export const readUsersWithStockOnSubscribedWatchlist = async (ticker: string): Promise<User[]> => {
  return (
    await client.user.findMany({ where: { watchlists: { some: { subscribed: true, stocks: { some: { ticker } } } } } })
  ).map((user) => new User(user));
};

/**
 * Check whether a user exists.
 * @param email The email address of the user.
 * @returns Whether the user exists.
 */
export const userExists = async (email: string): Promise<boolean> => {
  try {
    await client.user.findUniqueOrThrow({ where: { email } });
    return true;
  } catch {
    return false;
  }
};

/**
 * Update a user.
 * @param email The email address of the user.
 * @param newValues The new values for the user.
 * @throws an {@link APIError} if the user does not exist.
 */
export const updateUser = async (email: string, newValues: Partial<User>) => {
  let k: keyof typeof newValues; // all keys of new values
  const user = await readUser(email); // Read the user from the database
  let isNewData = false;
  // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
  for (k in newValues) {
    if (newValues[k] !== undefined) {
      /* c8 ignore next */ // Those properties are always caught by OpenAPI validation
      if (user[k] === undefined) throw new APIError(400, `Invalid property ${k} for user ${user.email}.`);
      if (newValues[k] === user[k]) {
        delete newValues[k];
        continue;
      }

      // New data is different from old data
      isNewData = true;
    }
  }

  if (isNewData) {
    await client.user.update({ where: { email: user.email }, data: { ...newValues } });
    logger.info(
      {
        prefix: "postgres",
        newValues: {
          ...newValues,
          ...("avatar" in newValues
            ? { avatar: newValues.avatar?.substring(0, 64).concat("…") ?? newValues.avatar }
            : {}),
        },
      },
      `Updated user ${email}`,
    );
  } else {
    // No new data was provided
    logger.info({ prefix: "postgres" }, `No updates for user ${email}.`);
  }
};

/**
 * Set the counter of a credential.
 * @param credentialID The ID of the credential.
 * @param counter The new counter.
 */
export const setCredentialCounter = async (credentialID: Uint8Array, counter: number) => {
  await client.webAuthnCredential.update({ where: { id: Buffer.from(credentialID) }, data: { counter } });
};

/**
 * Delete a user.
 * @param email The email address of the user to delete.
 * @throws an {@link APIError} if the user does not exist.
 */
export const deleteUser = async (email: string) => {
  try {
    // Attempt to delete a user with the given email address
    await client.user.delete({ where: { email } });
    logger.info({ prefix: "postgres" }, `Deleted user ${email}.`);
  } catch {
    // If deletion failed, the user does not exist
    throw new APIError(404, `User ${email} not found.`);
  }
};
