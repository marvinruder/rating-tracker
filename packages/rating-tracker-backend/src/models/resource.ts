import { Resource as CommonsResource } from "rating-tracker-commons";
import { Entity, Schema } from "redis-om";

export class Resource extends CommonsResource {
  /* istanbul ignore next */
  constructor(resourceEntity: ResourceEntity) {
    super();
    this.url = resourceEntity.entityId;
    this.fetchDate = resourceEntity.fetchDate;
    this.content = resourceEntity.content;
  }
}

export interface ResourceEntity {
  url: string;
  fetchDate: Date;
  content: string;
}

export class ResourceEntity extends Entity {}

export const resourceSchema = new Schema(ResourceEntity, {
  fetchDate: { type: "date" },
  content: { type: "string" },
});
