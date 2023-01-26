import chalk from "chalk";
import APIError from "../../../lib/apiError.js";
import logger, { PREFIX_REDIS } from "../../../lib/logger.js";
import {
  Resource,
  ResourceEntity,
  resourceSchema,
} from "../../../models/resource.js";
import { expire, fetch, save } from "./resourceRepositoryBase.js";

/**
 * Create a resource.
 *
 * @param {Resource} resource The resource to create.
 * @param {number} ttlInSeconds The time in seconds after which the resource should expire.
 * @return {boolean} Whether the resource was created.
 */
export const createResource = async (
  resource: Resource,
  ttlInSeconds?: number
): Promise<boolean> => {
  const existingResource = await fetch(resource.url); // Attempt to fetch an existing resource with the same URL
  /* istanbul ignore next */
  if (existingResource && existingResource.content) {
    // If that worked, a resource with the same URL already exists
    logger.warn(
      PREFIX_REDIS +
        chalk.yellowBright(
          `Skipping resource ${existingResource.url} – existing already.`
        )
    );
    return false;
  }
  const resourceEntity = new ResourceEntity(resourceSchema, resource.url, {
    ...resource,
  });
  logger.info(
    PREFIX_REDIS +
      `Created resource with entity ID ${await save(resourceEntity)}.`
  );
  ttlInSeconds && (await expire(resource.url, ttlInSeconds)); // If set, let the resource expire after the given time
  return true;
};

/**
 * Read a resource.
 *
 * @param {string} url The URL of the resource to read.
 * @return {Resource} The resource.
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
