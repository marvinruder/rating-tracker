import { Entity, Schema } from "redis-om";

export class Session {
  sessionID: string;
  email: string;
  /* istanbul ignore next */
  constructor(sessionEntity: SessionEntity) {
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
