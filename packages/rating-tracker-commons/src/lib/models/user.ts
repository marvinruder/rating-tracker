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
