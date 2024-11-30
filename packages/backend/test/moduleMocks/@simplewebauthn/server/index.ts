import type * as SimpleWebAuthnServer from "@simplewebauthn/server";

const randomCredential = crypto.randomUUID();

export const { generateRegistrationOptions, generateAuthenticationOptions } =
  await vi.importActual<typeof SimpleWebAuthnServer>("@simplewebauthn/server");

export const verifyRegistrationResponse = (
  options: SimpleWebAuthnServer.VerifyRegistrationResponseOpts,
): Promise<SimpleWebAuthnServer.VerifiedRegistrationResponse> => {
  if (options.response.id !== options.response.rawId) {
    // One of the errors that can be thrown by the actual implementation.
    throw new Error("Credential ID was not base64url-encoded");
  }
  return Promise.resolve({
    verified:
      (JSON.parse(Buffer.from(options.response.response.clientDataJSON, "base64url").toString("ascii")).challenge ===
        options.expectedChallenge &&
        JSON.parse(Buffer.from(options.response.response.clientDataJSON, "base64url").toString("ascii")).origin ===
          options.expectedOrigin &&
        options.expectedOrigin.includes(`${process.env.FQDN}`) &&
        options.expectedRPID !== undefined &&
        options.expectedRPID.includes(process.env.DOMAIN) &&
        options.requireUserVerification) ??
      false,
    registrationInfo: {
      fmt: "fido-u2f",
      aaguid: "",
      credential: {
        id: options.response.id,
        publicKey: new TextEncoder().encode(randomCredential),
        counter: 0,
      },
      credentialType: "public-key",
      attestationObject: new Uint8Array(),
      userVerified: options.requireUserVerification ?? false,
      credentialDeviceType: "multiDevice",
      credentialBackedUp: true,
      origin: Array.isArray(options.expectedOrigin) ? options.expectedOrigin[0] : options.expectedOrigin,
      rpID: Array.isArray(options.expectedRPID) ? options.expectedRPID[0] : options.expectedRPID,
    },
  });
};

export const verifyAuthenticationResponse = (
  options: SimpleWebAuthnServer.VerifyAuthenticationResponseOpts,
): Promise<SimpleWebAuthnServer.VerifiedAuthenticationResponse> => {
  if (options.response.id !== options.response.rawId) {
    // One of the errors that can be thrown by the actual implementation.
    throw new Error("Credential ID was not base64url-encoded");
  }
  return Promise.resolve({
    verified:
      (JSON.parse(Buffer.from(options.response.response.clientDataJSON, "base64url").toString("ascii")).challenge ===
        options.expectedChallenge &&
        JSON.parse(Buffer.from(options.response.response.clientDataJSON, "base64url").toString("ascii")).origin ===
          options.expectedOrigin &&
        // options.response.challenge === options.expectedChallenge &&
        options.expectedOrigin.includes(`${process.env.FQDN}`) &&
        options.expectedRPID.includes(process.env.DOMAIN) &&
        options.requireUserVerification &&
        options.credential.id === options.response.id &&
        new TextDecoder().decode(options.credential.publicKey) === randomCredential) ??
      false,
    authenticationInfo: {
      credentialID: options.response.id,
      newCounter: options.credential.counter + 1,
      userVerified: options.requireUserVerification ?? false,
      credentialDeviceType: "multiDevice",
      credentialBackedUp: true,
      origin: Array.isArray(options.expectedOrigin) ? options.expectedOrigin[0] : options.expectedOrigin,
      rpID: Array.isArray(options.expectedRPID) ? options.expectedRPID[0] : options.expectedRPID,
    },
  });
};
