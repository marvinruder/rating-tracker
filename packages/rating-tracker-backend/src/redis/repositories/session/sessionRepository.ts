import APIError from "../../../lib/apiError.js";
import { Session, SessionEntity, sessionSchema } from "../../../models/session.js";
import { refresh, fetch, save, remove } from "./sessionRepositoryBase.js";
import chalk from "chalk";
import { User } from "../../../models/user.js";
import { readUser } from "../user/userRepository.js";
import logger, { PREFIX_REDIS } from "../../../lib/logger.js";

/**
 * Create a session.
 *
 * @param {Session} session The session to create.
 * @returns {boolean} Whether the session was created.
 */
/* istanbul ignore next */ // Since we cannot yet test the authentication process, we cannot create a valid Session
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

export const deleteSession = async (sessionID: string) => {
  const sessionEntity = await fetch(sessionID);
  /* istanbul ignore else  */ // Not reached in current tests since a user can only delete their current session
  if (sessionEntity && sessionEntity.email) {
    const email = new Session(sessionEntity).email;
    await remove(sessionEntity.entityId);
    logger.info(PREFIX_REDIS + `Deleted session ${sessionID} for user “${email}”.`);
  } else {
    throw new APIError(404, `Session ${sessionID} not found.`);
  }
};
