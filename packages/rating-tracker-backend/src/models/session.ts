import { Session as CommonsSession } from "rating-tracker-commons";
import { Entity, Schema } from "redis-om";

export class Session extends CommonsSession {
  /* istanbul ignore next */
  constructor(sessionEntity: SessionEntity) {
    super();
    this.sessionID = sessionEntity.entityId;
    this.email = sessionEntity.email;
  }
}

export interface SessionEntity {
  sessionID: string;
  email: string;
}

export class SessionEntity extends Entity {}

export const sessionSchema = new Schema(SessionEntity, {
  email: { type: "string" },
});
