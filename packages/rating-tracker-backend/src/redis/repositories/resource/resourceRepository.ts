/* istanbul ignore file */
import chalk from "chalk";
import APIError from "../../../lib/apiError.js";
import logger, { PREFIX_REDIS } from "../../../lib/logger.js";
import {
  Resource,
  ResourceEntity,
  resourceSchema,
} from "../../../models/resource.js";
import { expire, fetch, save } from "./resourceRepositoryBase.js";

export const createResource = async (
  resource: Resource,
  ttlInSeconds?: number
): Promise<boolean> => {
  const existingResource = await fetch(resource.url);
  if (existingResource && existingResource.content) {
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
      chalk.greenBright(
        `Created resource for “${resource.url}” with entity ID ${await save(
          resourceEntity
        )}.`
      )
  );
  ttlInSeconds && (await expire(resource.url, ttlInSeconds));
  return true;
};

export const readResource = async (url: string) => {
  const resourceEntity = await fetch(url);
  if (resourceEntity && resourceEntity.content) {
    return new Resource(resourceEntity);
  } else {
    throw new APIError(404, `Resource ${url} not found.`);
  }
};
