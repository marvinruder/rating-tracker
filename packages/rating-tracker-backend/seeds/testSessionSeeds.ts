import { SessionEntity, sessionSchema } from "../src/models/session.js";
import { sessionRepository } from "../src/redis/repositories/sessionRepository.js";

/**
 * Clears and writes example session data into the session repository in Redis. Must only be used in tests.
 *
 * @returns {Promise<void>} a Promise that resolves after the operation is complete.
 */
export const applySessionSeed = async () => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Refusing to apply seed when not in a test environment");
  }

  await sessionRepository.save(
    new SessionEntity(sessionSchema, "exampleSessionID", {
      email: "jane.doe@example.com",
    })
  );
  await sessionRepository.save(
    new SessionEntity(sessionSchema, "anotherExampleSessionID", {
      email: "john.doe@example.com",
    })
  );
};
