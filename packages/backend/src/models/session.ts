import type { Session } from "@rating-tracker/commons";
import type { Entity } from "redis-om";
import { EntityId, Schema } from "redis-om";

export const isExistingSessionEntity = (entity: Entity): entity is Session & Entity =>
  entity && EntityId in entity && entity.email !== undefined && typeof entity.email === "string";

/**
 * A Redis schema of a session.
 */
export const sessionSchema = new Schema(
  "session",
  {
    email: { type: "string" },
  },
  { dataStructure: "HASH" },
);
