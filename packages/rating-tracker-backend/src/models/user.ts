import { User as CommonsUser } from "rating-tracker-commons";
import { Entity, Schema } from "redis-om";

/**
 * A user of the application. Contains WebAuthn credentials.
 */
export class User extends CommonsUser {
  /**
   * Creates a new {@link User} from its Redis entity.
   *
   * @param {UserEntity} userEntity The Redis entity of the user.
   */
  constructor(userEntity: UserEntity) {
    super();
    this.email = userEntity.entityId; // The email is used as the entity’s ID
    this.name = userEntity.name;
    this.accessRights = userEntity.accessRights;
    this.credentialID = userEntity.credentialID;
    this.credentialPublicKey = userEntity.credentialPublicKey;
    this.counter = userEntity.counter;
  }
}

/**
 * A Redis entity of a {@link User}.
 */
export interface UserEntity {
  email: string;
  name: string;
  accessRights: number;
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
}

export class UserEntity extends Entity {}

/**
 * A Redis schema of a {@link UserEntity}.
 * @see {@link User}
 */
export const userSchema = new Schema(UserEntity, {
  name: { type: "string" },
  accessRights: { type: "number" },
  credentialID: { type: "string" },
  credentialPublicKey: { type: "string" },
  counter: { type: "number" },
});
