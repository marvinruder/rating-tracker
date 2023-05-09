import { Session as CommonsSession } from "@rating-tracker/commons";
import { Entity, Schema } from "redis-om";

/**
 * A session related to a user, the ID of which is stored in a cookie.
 */
export class Session extends CommonsSession {
  /**
   * Creates a new {@link Session} from its Redis entity.
   *
   * @param {SessionEntity} sessionEntity The Redis entity of the session.
   */
  constructor(sessionEntity: SessionEntity) {
    super();
    this.sessionID = sessionEntity.entityId;
    this.email = sessionEntity.email;
  }
}

/**
 * A Redis entity of a {@link Session}.
 */
export interface SessionEntity {
  /**
   * The ID of the session, used as a token in session cookies.
   */
  sessionID: string;
  /**
   * The email address of the user.
   */
  email: string;
}

/**
 * A Redis entity of a {@link Session}.
 */
export class SessionEntity extends Entity {}

/**
 * A Redis schema of a {@link SessionEntity}.
 *
 * @see {@link Session}
 */
export const sessionSchema = new Schema(
  SessionEntity,
  {
    email: { type: "string" },
  },
  { dataStructure: "HASH" }
);
