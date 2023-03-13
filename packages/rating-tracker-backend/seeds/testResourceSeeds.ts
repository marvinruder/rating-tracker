import { ResourceEntity, resourceSchema } from "../src/models/resource.js";
import { resourceRepository } from "../src/redis/repositories/resource/resourceRepositoryBase.js";

/**
 * Clears and writes example resource data into the resource repository in Redis. Must only be used in tests.
 *
 * @returns {Promise<void>} a Promise that resolves after the operation is complete.
 */
export const applyResourceSeed = async () => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Refusing to apply seed when not in a test environment");
  }

  await resourceRepository.save(
    new ResourceEntity(resourceSchema, "image.png", {
      content: "U2FtcGxlIFBORyBpbWFnZQ==",
    })
  );
};
