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
}
