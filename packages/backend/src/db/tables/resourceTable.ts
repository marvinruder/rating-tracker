import { pluralize, type Resource } from "@rating-tracker/commons";

import APIError from "../../utils/APIError";
import logger from "../../utils/logger";
import client from "../client";

export type ResourceWithExpire = Resource & { expiresAt: Date };

/**
 * Create a resource.
 * @param resource The resource to create.
 * @param ttlInSeconds The time in seconds after which the resource should expire.
 */
export const createResource = async (resource: Resource, ttlInSeconds: number): Promise<void> => {
  await client.resource.upsert({
    where: { uri: resource.uri },
    create: {
      uri: resource.uri,
      content: Buffer.from(resource.content),
      contentType: resource.contentType,
      expiresAt: new Date(Date.now() + ttlInSeconds * 1000),
    },
    update: {
      uri: resource.uri,
      content: Buffer.from(resource.content),
      lastModifiedAt: new Date(),
      expiresAt: new Date(Date.now() + ttlInSeconds * 1000),
    },
  });
  logger.info({ prefix: "postgres" }, `Created resource with URI ${resource.uri}.`);
};

/**
 * Read a resource.
 * @param uri The URI of the resource to read.
 * @returns The resource including its expiration date.
 * @throws an {@link APIError} if the resource does not exist.
 */
export const readResource = async (uri: string): Promise<ResourceWithExpire> => {
  try {
    return await client.resource.findUniqueOrThrow({ where: { uri, expiresAt: { gte: new Date() } } });
  } catch (e) {
    throw new APIError(404, "Resource not found.");
  }
};

/**
 * Delete all expired resources.
 */
export const cleanupResources = async () => {
  const deletedResources = await client.resource.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  if (deletedResources.count)
    logger.info(
      { prefix: "postgres" },
      `Deleted ${deletedResources.count} expired resource${pluralize(deletedResources.count)}.`,
    );
};
