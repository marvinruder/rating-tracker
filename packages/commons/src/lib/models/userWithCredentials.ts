import type { OmitFunctions } from "../OmitFunctions";

import { User } from "./user";

/**
 * A user of the application with WebAuthn credentials.
 */
export class UserWithCredentials extends User {
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

  /**
   * Creates a new user from user information.
   * @param user The user information.
   */
  constructor(user: OmitFunctions<User | UserWithCredentials>) {
    super(user);
    Object.assign(this, user);
  }
}
