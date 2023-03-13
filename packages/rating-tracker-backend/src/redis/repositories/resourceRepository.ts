import chalk from "chalk";
import APIError from "../../utils/apiError.js";
import logger, { PREFIX_REDIS } from "../../utils/logger.js";
import { Resource, ResourceEntity, resourceSchema } from "../../models/resource.js";
import client from "../client.js";

/**
 * The resource repository.
 */
export const resourceRepository = client.fetchRepository(resourceSchema);

/**
 * Fetch a resource from the repository.
 *
 * @param {string} id The ID of the resource to fetch.
 * @returns {ResourceEntity} The resource entity.
 */
const fetch = (id: string) => {
  return resourceRepository.fetch(id);
};

/**
 * Save a resource to the repository.
 *
 * @param {ResourceEntity} resourceEntity The resource entity to save.
 * @returns {string} The ID of the saved resource.
 */
const save = (resourceEntity: ResourceEntity) => {
  return resourceRepository.save(resourceEntity);
};

/**
 * Have the repository expire a resource.
 *
 * @param {string} id The ID of the resource to expire.
 * @param {number} ttlInSeconds The time in seconds after which the resource should expire.
 * @returns {void}
 */
const expire = (id: string, ttlInSeconds: number) => {
  return resourceRepository.expire(id, ttlInSeconds);
};

// /**
//  * Delete a resource from the repository.
//  *
//  * @param {string} id The ID of the resource to delete.
//  * @returns {void}
//  */
// const remove = (id: string) => {
//   return resourceRepository.remove(id);
// };

/**
 * Create a resource.
 *
 * @param {Resource} resource The resource to create.
 * @param {number} ttlInSeconds The time in seconds after which the resource should expire.
 * @returns {boolean} Whether the resource was created.
 */
export const createResource = async (resource: Resource, ttlInSeconds?: number): Promise<boolean> => {
  const existingResource = await fetch(resource.url); // Attempt to fetch an existing resource with the same URL
  // Difficult to test since the implementation always checks whether a cached resource exists before creating a new one
  /* istanbul ignore next -- @preserve */
  if (existingResource && existingResource.content) {
    // If that worked, a resource with the same URL already exists
    logger.warn(PREFIX_REDIS + chalk.yellowBright(`Skipping resource ${existingResource.url} – existing already.`));
    return false;
  }
  const resourceEntity = new ResourceEntity(resourceSchema, resource.url, {
    ...resource,
  });
  logger.info(PREFIX_REDIS + `Created resource with entity ID ${await save(resourceEntity)}.`);
  ttlInSeconds && (await expire(resource.url, ttlInSeconds)); // If set, let the resource expire after the given time
  return true;
};

/**
 * Read a resource.
 *
 * @param {string} url The URL of the resource to read.
 * @returns {Resource} The resource.
 * @throws an {@link APIError} if the resource does not exist.
 */
export const readResource = async (url: string) => {
  const resourceEntity = await fetch(url);
  if (resourceEntity && resourceEntity.content) {
    return new Resource(resourceEntity);
  } else {
    throw new APIError(404, `Resource ${url} not found.`);
  }
};
