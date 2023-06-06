import APIError from "../../utils/apiError.js";
import { Session, SessionEntity, sessionSchema } from "../../models/session.js";
import chalk from "chalk";
import { User } from "@rating-tracker/commons";
import { readUser } from "../../db/tables/userTable.js";
import logger, { PREFIX_REDIS } from "../../utils/logger.js";
import client from "../client.js";

/**
 * The time in seconds after which a session should expire.
 */
export const sessionTTLInSeconds = 1800;

/**
 * The session repository.
 */
export const sessionRepository = client.fetchRepository(sessionSchema);

/**
 * Fetch a session from the repository.
 *
 * @param {string} id The ID of the session to fetch.
 * @returns {Promise<SessionEntity>} The session entity.
 */
const fetchSession = (id: string): Promise<SessionEntity> => {
  return sessionRepository.fetch(id);
};

/**
 * Sets the expiration time of a session to the configured TTL.
 *
 * @param {string} id The ID of the session to refresh.
 * @returns {Promise<void>}
 */
const refreshSession = (id: string): Promise<void> => {
  return sessionRepository.expire(id, sessionTTLInSeconds);
};

/**
 * Save a session to the repository.
 *
 * @param {SessionEntity} sessionEntity The session entity to save.
 * @returns {Promise<string>} The ID of the saved session.
 */
const saveSession = (sessionEntity: SessionEntity): Promise<string> => {
  return sessionRepository.save(sessionEntity);
};

/**
 * Delete a session from the repository.
 *
 * @param {string} id The ID of the session to delete.
 * @returns {Promise<void>}
 */
const removeSession = (id: string): Promise<void> => {
  return sessionRepository.remove(id);
};

/**
 * Create a session.
 *
 * @param {Session} session The session to create.
 * @returns {boolean} Whether the session was created.
 */
export const createSession = async (session: Session): Promise<boolean> => {
  // Attempt to fetch an existing session with the same ID
  const existingSession = await fetchSession(session.sessionID);
  // Difficult to test since session IDs are always created randomly
  /* c8 ignore start */
  if (existingSession && existingSession.email) {
    // If that worked, a session with the same ID already exists
    logger.warn(PREFIX_REDIS + chalk.yellowBright(`Skipping session ${existingSession.entityId} – existing already.`));
    return false;
  }
  /* c8 ignore stop */
  const sessionEntity = new SessionEntity(sessionSchema, session.sessionID, {
    ...session,
  });
  logger.info(
    PREFIX_REDIS + `Created session for “${session.email}” with entity ID ${await saveSession(sessionEntity)}.`
  );
  await refreshSession(session.sessionID); // Let the session expire after 30 minutes
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
  const sessionEntity = await fetchSession(sessionID);
  if (sessionEntity && sessionEntity.email) {
    refreshSession(sessionID); // Let the session expire after 30 minutes
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
  const sessionEntity = await fetchSession(sessionID);
  if (sessionEntity && sessionEntity.email) {
    const email = new Session(sessionEntity).email;
    await removeSession(sessionEntity.entityId);
    logger.info(PREFIX_REDIS + `Deleted session ${sessionID} for user “${email}”.`);
    /* c8 ignore next */ // Not reached in current tests since a user can only delete their current session
  } else throw new APIError(404, `Session ${sessionID} not found.`);
};
