// We use bitwise operators to combine several boolean access rights into a single number.
export const GENERAL_ACCESS = 1 << 0;
export const WRITE_STOCKS = 1 << 1;
export const MANAGE_USERS = 1 << 7;

/**
 * A user of the application. Contains WebAuthn credentials.
 */
export class User {
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
  avatar?: string;
  /**
   * The phone number of the user, used for Signal messages.
   */
  phone?: string;
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

  /**
   * Creates a new user from partial user information.
   *
   * @param {Partial<User>} user The partial user information.
   */
  constructor(user?: Partial<User>) {
    if (user) {
      Object.assign(this, user);
    }
  }

  /**
   * Checks whether the user has the given access right.
   *
   * @param {number} accessRight The access right to check.
   * @returns {boolean} Whether the user has the given access right.
   */
  public hasAccessRight(accessRight: number): boolean {
    return (this.accessRights & accessRight) === accessRight;
  }
}
