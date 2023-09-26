import redis from "../../src/redis/redis";
import { resourceRepository } from "../../src/redis/repositories/resourceRepository";
import { sessionRepository } from "../../src/redis/repositories/sessionRepository";

/**
 * Writes example resource data into the resource repository in Redis. Must only be used in tests.
 */
const applyResourceSeed = async (): Promise<void> => {
  await resourceRepository.save("image.png", {
    content: "U2FtcGxlIFBORyBpbWFnZQ==",
    fetchDate: new Date(),
  });
};

/**
 * Writes example session data into the session repository in Redis. Must only be used in tests.
 */
const applySessionSeed = async (): Promise<void> => {
  await sessionRepository.save("exampleSessionID", {
    email: "jane.doe@example.com",
  });
  await sessionRepository.save("anotherExampleSessionID", {
    email: "john.doe@example.com",
  });
};

/**
 * Clears and writes example data into the repositories in Redis. Must only be used in tests.
 */
const applyRedisSeeds = async (): Promise<void> => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Refusing to apply seed when not in a test environment");
  }

  await redis.flushAll();

  await Promise.all([applyResourceSeed(), applySessionSeed()]);
};

export default applyRedisSeeds;
