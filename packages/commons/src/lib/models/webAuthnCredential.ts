/**
 * A WebAuthn credential.
 */
export type WebAuthnCredential = {
  /**
   * The ID of the WebAuthn credential.
   */
  id: Uint8Array;
  /**
   * The public key of the WebAuthn credential.
   */
  publicKey: Uint8Array;
  /**
   * The counter of the WebAuthn credential, indicating the number of times it has been used.
   */
  counter: number;
};
