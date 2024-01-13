import { Session, User } from "@rating-tracker/commons";
import { Entity, EntityId, Repository } from "redis-om";

import { readUser } from "../../db/tables/userTable";
import { isExistingSessionEntity, sessionSchema } from "../../models/session";
import APIError from "../../utils/APIError";
import logger from "../../utils/logger";
import { redis } from "../redis";

/**
 * The time in seconds after which a session should expire.
 */
export const sessionTTLInSeconds = 1800;

/**
 * The session repository.
 */
export const sessionRepository = new Repository(sessionSchema, redis);

/**
 * Fetch a session from the repository.
 *
 * @param {string} sessionID The ID of the session to fetch.
 * @returns {Promise<Entity>} The session entity.
 */
const fetchSession = (sessionID: string): Promise<Entity> => sessionRepository.fetch(sessionID);

/**
 * Sets the expiration time of a session to the configured TTL.
 *
 * @param {string} sessionID The ID of the session to refresh.
 * @returns {Promise<void>}
 */
const refreshSession = (sessionID: string): Promise<void> => sessionRepository.expire(sessionID, sessionTTLInSeconds);

/**
 * Save a session to the repository.
 *
 * @param {Session} session The session to save.
 * @returns {Promise<Entity>} The saved session entity, containing an {@link EntityId}.
 */
const saveSession = (session: Session): Promise<Entity> => sessionRepository.save(session.sessionID, { ...session });

/**
 * Delete a session from the repository.
 *
 * @param {string} sessionID The ID of the session to delete.
 * @returns {Promise<void>}
 */
const removeSession = (sessionID: string): Promise<void> => sessionRepository.remove(sessionID);

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
  if (isExistingSessionEntity(existingSession)) {
    // If that worked, a session with the same ID already exists
    logger.warn({ prefix: "redis" }, `Skipping session ${existingSession.entityId} – existing already.`);
    return false;
  }
  /* c8 ignore stop */
  logger.info(
    { prefix: "redis" },
    `Created session for “${session.email}” with entity ID ${(await saveSession(session))[EntityId]}.`,
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
  const entity = await fetchSession(sessionID);
  if (isExistingSessionEntity(entity)) {
    await refreshSession(sessionID); // Let the session expire after 30 minutes
    return await readUser(entity.email);
  }
  throw new APIError(404, `Session ${sessionID} not found.`);
};

/**
 * Update a session from Redis.
 *
 * @param {string} sessionID The session ID.
 * @param {string} email The email address to update the session with.
 */
export const updateSession = async (sessionID: string, email: string) => {
  const entity = await fetchSession(sessionID);
  if (isExistingSessionEntity(entity)) {
    await saveSession({ sessionID: entity[EntityId], email });
    logger.info({ prefix: "redis" }, `Updated session ${sessionID} for user “${email}”.`);
    /* c8 ignore next */ // Not reached in current tests since a user can only update their current session
  } else throw new APIError(404, `Session ${sessionID} not found.`);
};

/**
 * Delete a session from Redis.
 *
 * @param {string} sessionID The session ID.
 */
export const deleteSession = async (sessionID: string) => {
  const entity = await fetchSession(sessionID);
  if (isExistingSessionEntity(entity)) {
    const { email } = entity;
    await removeSession(entity[EntityId]);
    logger.info({ prefix: "redis" }, `Deleted session ${sessionID} for user “${email}”.`);
    /* c8 ignore next */ // Not reached in current tests since a user can only delete their current session
  } else throw new APIError(404, `Session ${sessionID} not found.`);
};
