import { ResourceEntity, resourceSchema } from "../../src/models/resource";
import { resourceRepository } from "../../src/redis/repositories/resourceRepository";
import { SessionEntity, sessionSchema } from "../../src/models/session";
import { sessionRepository } from "../../src/redis/repositories/sessionRepository";
import client from "../../src/redis/client";

/**
 * Writes example resource data into the resource repository in Redis. Must only be used in tests.
 */
const applyResourceSeed = async (): Promise<void> => {
  await resourceRepository.save(
    new ResourceEntity(resourceSchema, "image.png", {
      content: "U2FtcGxlIFBORyBpbWFnZQ==",
    })
  );
};

/**
 * Writes example session data into the session repository in Redis. Must only be used in tests.
 */
const applySessionSeed = async (): Promise<void> => {
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

/**
 * Clears and writes example data into the repositories in Redis. Must only be used in tests.
 */
const applyRedisSeeds = async (): Promise<void> => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Refusing to apply seed when not in a test environment");
  }

  await client.execute(["FLUSHALL"]);

  await Promise.all([applyResourceSeed(), applySessionSeed()]);
};

export default applyRedisSeeds;
