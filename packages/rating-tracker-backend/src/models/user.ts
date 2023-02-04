import { User as CommonsUser } from "rating-tracker-commons";
import { Entity, Schema } from "redis-om";

/**
 * A user of the application. Contains WebAuthn credentials.
 */
export class User extends CommonsUser {
  /**
   * Creates a new {@link User} from either its Redis entity or a partial User object.
   *
   * @param {UserEntity | Partial<User>} userEntity The Redis entity of the user or a partial User object.
   */
  constructor(userEntity: UserEntity | Partial<User>) {
    super();
    // Creating a user from a partial object is only done during registration, which is not currently tested
    /* istanbul ignore else */
    if (userEntity instanceof UserEntity) {
      this.email = userEntity.entityId; // The email is used as the entity’s ID
    } else {
      this.email = userEntity.email;
    }
    this.name = userEntity.name;
    if (userEntity.avatar != null) this.avatar = userEntity.avatar;
    if (userEntity.phone != null) this.phone = userEntity.phone;
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
  /**
   * The email address of the user, used as a unique identifier.
   */
  email: string;
  /**
   * The common name of the user.
   */
  name: string;
  /**
   * The base64-encoded avatar of the user.
   */
  avatar: string;
  /**
   * The phone number of the user, used for Signal messages.
   */
  phone: string;
  /**
   * The access rights of the user, encoded as a bitfield.
   */
  accessRights: number;
  /**
   * The ID of the WebAuthn credential.
   */
  credentialID: string;
  /**
   * The public key of the WebAuthn credential.
   */
  credentialPublicKey: string;
  /**
   * The counter of the WebAuthn credential, indicating the number of times it has been used.
   */
  counter: number;
}

/**
 * A Redis entity of a {@link User}.
 */
export class UserEntity extends Entity {}

/**
 * A Redis schema of a {@link UserEntity}.
 *
 * @see {@link User}
 */
export const userSchema = new Schema(UserEntity, {
  name: { type: "string" },
  avatar: { type: "string" },
  phone: { type: "string" },
  accessRights: { type: "number" },
  credentialID: { type: "string" },
  credentialPublicKey: { type: "string" },
  counter: { type: "number" },
});
