import type { Resource } from "@rating-tracker/commons";
import { pluralize } from "@rating-tracker/commons";

import type DBService from "../db/db.service";
import NotFoundError from "../utils/error/api/NotFoundError";
import Logger from "../utils/logger";

export type ResourceWithExpire = Resource & { expiresAt: Date };

/**
 * This service provides methods to interact with resources.
 */
class ResourceService {
  constructor(dbService: DBService) {
    const { resource } = dbService;
    this.db = { resource };
  }

  /**
   * A service that provides access to the database.
   */
  private db: Pick<DBService, "resource">;

  /**
   * Create a resource.
   * @param resource The resource to create.
   * @param ttlInSeconds The time in seconds after which the resource should expire.
   */
  async create(resource: Resource, ttlInSeconds: number): Promise<void> {
    await this.db.resource.upsert({
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
    Logger.info({ component: "postgres", resource: resource.uri }, "Created resource");
  }

  /**
   * Read a resource.
   * @param uri The URI of the resource to read.
   * @returns The resource including its expiration date.
   * @throws an {@link APIError} if the resource does not exist.
   */
  async read(uri: string): Promise<ResourceWithExpire> {
    try {
      return await this.db.resource.findUniqueOrThrow({ where: { uri, expiresAt: { gte: new Date() } } });
    } catch (e) {
      throw new NotFoundError(`Resource ${uri} not found.`);
    }
  }

  /**
   * Delete all expired resources.
   */
  async cleanup() {
    const deletedResources = await this.db.resource.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    if (deletedResources.count)
      Logger.info(
        { component: "postgres", count: deletedResources.count },
        `Deleted expired resource${pluralize(deletedResources.count)}`,
      );
  }
}

export default ResourceService;
