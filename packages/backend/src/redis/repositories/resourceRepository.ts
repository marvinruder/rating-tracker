import chalk from "chalk";
import APIError from "../../utils/apiError.js";
import logger, { PREFIX_REDIS } from "../../utils/logger.js";
import { isExistingResourceEntity, resourceSchema } from "../../models/resource.js";
import redis from "../redis.js";
import { Entity, EntityId, Repository } from "redis-om";
import { Resource } from "@rating-tracker/commons";

/**
 * The resource repository.
 */
export const resourceRepository = new Repository(resourceSchema, redis);

/**
 * Fetch a resource from the repository.
 *
 * @param {string} url The URL of the resource to fetch.
 * @returns {Promise<Entity>} The resource entity.
 */
const fetchResource = (url: string): Promise<Entity> => resourceRepository.fetch(url);

/**
 * Save a resource to the repository.
 *
 * @param {Resource} resource The resource to save.
 * @returns {Promise<Entity>} The saved resource entity, containing an {@link EntityId}.
 */
const saveResource = (resource: Resource): Promise<Entity> => resourceRepository.save(resource.url, { ...resource });

/**
 * Have the repository expire a resource.
 *
 * @param {string} url The URL of the resource to expire.
 * @param {number} ttlInSeconds The time in seconds after which the resource should expire.
 * @returns {Promise<void>}
 */
const expireResource = (url: string, ttlInSeconds: number): Promise<void> =>
  resourceRepository.expire(url, ttlInSeconds);

/**
 * Create a resource.
 *
 * @param {Resource} resource The resource to create.
 * @param {number} ttlInSeconds The time in seconds after which the resource should expire.
 * @returns {Promise<boolean>} Whether the resource was created.
 */
export const createResource = async (resource: Resource, ttlInSeconds?: number): Promise<boolean> => {
  const existingResource = await fetchResource(resource.url); // Attempt to fetch an existing resource with the same URL
  // Difficult to test since the implementation always checks whether a cached resource exists before creating a new one
  /* c8 ignore start */
  if (isExistingResourceEntity(existingResource)) {
    // If that worked, a resource with the same URL already exists
    logger.warn(PREFIX_REDIS + chalk.yellowBright(`Skipping resource ${existingResource.url} – existing already.`));
    return false;
  }
  /* c8 ignore stop */
  logger.info(PREFIX_REDIS + `Created resource with entity ID ${(await saveResource(resource))[EntityId]}.`);
  // If set, let the resource expire after the given time
  ttlInSeconds && (await expireResource(resource.url, ttlInSeconds));
  return true;
};

/**
 * Read a resource.
 *
 * @param {string} url The URL of the resource to read.
 * @returns {Promise<Resource>} The resource.
 * @throws an {@link APIError} if the resource does not exist.
 */
export const readResource = async (url: string): Promise<Resource> => {
  const entity = await fetchResource(url);
  if (isExistingResourceEntity(entity)) {
    return {
      url: entity[EntityId],
      fetchDate: entity.fetchDate,
      content: entity.content,
    };
  } else throw new APIError(404, `Resource ${url} not found.`);
};
