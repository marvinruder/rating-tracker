import { Resource as CommonsResource } from "rating-tracker-commons";
import { Entity, Schema } from "redis-om";

/**
 * A cached webpage, API response, image or other resource from the web.
 */
export class Resource extends CommonsResource {
  /**
   * Creates a new {@link Resource} from its Redis entity.
   *
   * @param {ResourceEntity} resourceEntity The Redis entity of the resource.
   */
  /* istanbul ignore next */ // We do not yet have test data to create a valid Resource
  constructor(resourceEntity: ResourceEntity) {
    super();
    this.url = resourceEntity.entityId; // The original URL is used as the entity’s ID
    this.fetchDate = resourceEntity.fetchDate;
    this.content = resourceEntity.content;
  }
}

/**
 * A Redis entity of a {@link Resource}.
 */
export interface ResourceEntity {
  /**
   * The URL of the resource, used as a unique identifier.
   */
  url: string;
  /**
   * The date and time of the last fetch.
   */
  fetchDate: Date;
  /**
   * The content of the resource.
   */
  content: string;
}

export class ResourceEntity extends Entity {}

/**
 * A Redis schema of a {@link ResourceEntity}.
 * @see {@link Resource}
 */
export const resourceSchema = new Schema(ResourceEntity, {
  fetchDate: { type: "date" },
  content: { type: "string" },
});
