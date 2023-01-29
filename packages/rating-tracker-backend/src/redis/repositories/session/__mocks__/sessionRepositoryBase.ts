import { SessionEntity, sessionSchema } from "../../../../models/session.js";

/**
 * The time in seconds after which a session should expire.
 */
export const sessionTTLInSeconds = 1800;

/**
 * A mock repository for testing purposes.
 */
let sessionRepository: Map<string, SessionEntity>;

/**
 * Initializes the mock repository with one exemplary session.
 */
export const initSessionRepository = () => {
  sessionRepository = new Map<string, SessionEntity>();
  sessionRepository.set(
    "exampleSessionID",
    new SessionEntity(sessionSchema, "exampleSessionID", {
      email: "jane.doe@example.com",
    })
  );
  sessionRepository.set(
    "anotherExampleSessionID",
    new SessionEntity(sessionSchema, "anotherExampleSessionID", {
      email: "john.doe@example.com",
    })
  );
};

/**
 * Fetch a session from the mock repository.
 *
 * @param {string} id The ID of the session to fetch.
 * @returns {SessionEntity} The session entity.
 */
export const fetch = (id: string) => {
  return sessionRepository.get(id);
};

/**
 * Sets the expiration time of a session to the configured TTL.
 *
 * @returns {void}
 */
// TODO implement when tested
export const refresh = () => {
  return;
};

/**
 * Save a session to the mock repository.
 *
 * @param {SessionEntity} sessionEntity The session entity to save.
 * @returns {string} The ID of the saved session.
 */
export const save = (sessionEntity: SessionEntity) => {
  sessionRepository.set(sessionEntity.entityId, sessionEntity);
  return sessionEntity.entityId;
};

/**
 * Delete a session from the mock repository.
 *
 * @param {string} id The ID of the session to delete.
 * @returns {void}
 */
export const remove = (id: string) => {
  return sessionRepository.delete(id);
};
