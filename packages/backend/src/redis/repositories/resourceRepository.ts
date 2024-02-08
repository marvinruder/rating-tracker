import type { Resource } from "@rating-tracker/commons";
import type { Entity } from "redis-om";
import { EntityId, Repository } from "redis-om";

import { isExistingResourceEntity, resourceSchema } from "../../models/resource";
import APIError from "../../utils/APIError";
import logger from "../../utils/logger";
import { redis } from "../redis";

/**
 * The resource repository.
 */
export const resourceRepository = new Repository(resourceSchema, redis);

/**
 * Fetch a resource from the repository.
 * @param url The URL of the resource to fetch.
 * @returns The resource entity.
 */
const fetchResource = (url: string): Promise<Entity> => resourceRepository.fetch(url);

/**
 * Save a resource to the repository.
 * @param resource The resource to save.
 * @returns The saved resource entity, containing an {@link EntityId}.
 */
const saveResource = (resource: Resource): Promise<Entity> => resourceRepository.save(resource.url, { ...resource });

/**
 * Have the repository expire a resource.
 * @param url The URL of the resource to expire.
 * @param ttlInSeconds The time in seconds after which the resource should expire.
 * @returns a {@link Promise} that resolves when the resource TTL has been set.
 */
const expireResource = (url: string, ttlInSeconds: number): Promise<void> =>
  resourceRepository.expire(url, ttlInSeconds);

/**
 * Create a resource.
 * @param resource The resource to create.
 * @param ttlInSeconds The time in seconds after which the resource should expire.
 * @returns Whether the resource was created.
 */
export const createResource = async (resource: Resource, ttlInSeconds?: number): Promise<boolean> => {
  const existingResource = await fetchResource(resource.url); // Attempt to fetch an existing resource with the same URL
  // Difficult to test since the implementation always checks whether a cached resource exists before creating a new one
  /* c8 ignore start */
  if (isExistingResourceEntity(existingResource)) {
    // If that worked, a resource with the same URL already exists
    logger.warn({ prefix: "redis" }, `Skipping resource ${existingResource.url} – existing already.`);
    return false;
  }
  /* c8 ignore stop */
  logger.info({ prefix: "redis" }, `Created resource with entity ID ${(await saveResource(resource))[EntityId]}.`);
  // If set, let the resource expire after the given time
  ttlInSeconds && (await expireResource(resource.url, ttlInSeconds));
  return true;
};

/**
 * Read a resource.
 * @param url The URL of the resource to read.
 * @returns The resource.
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

/**
 * Read a resource’s TTL (time-to-live). Returns -1 if the resource exists but has no associated expire.
 * @param url The URL of the resource to read.
 * @returns The TTL, in seconds.
 * @throws an {@link APIError} if the resource does not exist.
 */
export const readResourceTTL = async (url: string): Promise<number> => {
  // eslint-disable-next-line new-cap
  const ttl = await redis.TTL(resourceSchema.schemaName + ":" + url);
  if (ttl === -2) throw new APIError(404, `Resource ${url} not found.`);
  return ttl;
};
