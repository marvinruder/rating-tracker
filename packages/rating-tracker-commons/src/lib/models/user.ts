/**
 * A user of the application. Contains WebAuthn credentials.
 */
export class User {
  email: string;
  name: string;
  accessRights: number;
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
}
