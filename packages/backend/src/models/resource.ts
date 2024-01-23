import type { Resource } from "@rating-tracker/commons";
import type { Entity } from "redis-om";
import { EntityId, Schema } from "redis-om";

export const isExistingResourceEntity = (entity: Entity): entity is Resource & Entity =>
  entity &&
  EntityId in entity &&
  entity.fetchDate !== undefined &&
  entity.fetchDate instanceof Date &&
  entity.content !== undefined &&
  typeof entity.content === "string";

/**
 * A Redis schema of a resource.
 */
export const resourceSchema = new Schema(
  "resource",
  {
    fetchDate: { type: "date" },
    content: { type: "string" },
  },
  { dataStructure: "HASH" },
);
