/* istanbul ignore file -- @preserve */ // This file is mocked since tests must not depend on a running Redis instance
import { SessionEntity, sessionSchema } from "../../../models/session.js";
import client from "../../Client.js";

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
 * @returns {SessionEntity} The session entity.
 */
export const fetch = (id: string) => {
  return sessionRepository.fetch(id);
};

/**
 * Sets the expiration time of a session to the configured TTL.
 *
 * @param {string} id The ID of the session to refresh.
 * @returns {void}
 */
export const refresh = (id: string) => {
  return sessionRepository.expire(id, sessionTTLInSeconds);
};

/**
 * Save a session to the repository.
 *
 * @param {SessionEntity} sessionEntity The session entity to save.
 * @returns {string} The ID of the saved session.
 */
export const save = (sessionEntity: SessionEntity) => {
  return sessionRepository.save(sessionEntity);
};

/**
 * Delete a session from the repository.
 *
 * @param {string} id The ID of the session to delete.
 * @returns {void}
 */
export const remove = (id: string) => {
  return sessionRepository.remove(id);
};
