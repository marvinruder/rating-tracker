import APIError from "../../../utils/apiError.js";
import { Session, SessionEntity, sessionSchema } from "../../../models/session.js";
import { refresh, fetch, save, remove } from "./sessionRepositoryBase.js";
import chalk from "chalk";
import { User } from "rating-tracker-commons";
import { readUser } from "../../../db/tables/userTable.js";
import logger, { PREFIX_REDIS } from "../../../utils/logger.js";

/**
 * Create a session.
 *
 * @param {Session} session The session to create.
 * @returns {boolean} Whether the session was created.
 */
// Since we cannot yet test the authentication process, we cannot create a valid Session
/* istanbul ignore next -- @preserve */
export const createSession = async (session: Session): Promise<boolean> => {
  const existingSession = await fetch(session.sessionID); // Attempt to fetch an existing session with the same ID
  if (existingSession && existingSession.email) {
    // If that worked, a session with the same ID already exists
    logger.warn(PREFIX_REDIS + chalk.yellowBright(`Skipping session ${existingSession.entityId} – existing already.`));
    return false;
  }
  const sessionEntity = new SessionEntity(sessionSchema, session.sessionID, {
    ...session,
  });
  logger.info(PREFIX_REDIS + `Created session for “${session.email}” with entity ID ${await save(sessionEntity)}.`);
  await refresh(session.sessionID); // Let the session expire after 30 minutes
  return true;
};

/**
 * Fetch a session from Redis, refresh it, and return the corresponding user.
 *
 * @param {string} sessionID The session ID.
 * @returns {User} The user corresponding to the session.
 * @throws an {@link APIError} if the session does not exist.
 */
export const refreshSessionAndFetchUser = async (sessionID: string): Promise<User> => {
  const sessionEntity = await fetch(sessionID);
  if (sessionEntity && sessionEntity.email) {
    refresh(sessionID); // Let the session expire after 30 minutes
    return await readUser(sessionEntity.email);
  }
  throw new APIError(404, `Session ${sessionID} not found.`);
};

// export const readSession = async (sessionID: string) => {
//   const sessionEntity = await fetch(sessionID);
//   if (sessionEntity && sessionEntity.email) {
//     return new Session(sessionEntity);
//   } else {
//     throw new APIError(404, `Session ${sessionID} not found.`);
//   }
// };

/**
 * Delete a session from Redis.
 *
 * @param {string} sessionID The session ID.
 */
export const deleteSession = async (sessionID: string) => {
  const sessionEntity = await fetch(sessionID);
  // Not reached in current tests since a user can only delete their current session
  /* istanbul ignore else -- @preserve */
  if (sessionEntity && sessionEntity.email) {
    const email = new Session(sessionEntity).email;
    await remove(sessionEntity.entityId);
    logger.info(PREFIX_REDIS + `Deleted session ${sessionID} for user “${email}”.`);
  } else {
    throw new APIError(404, `Session ${sessionID} not found.`);
  }
};
