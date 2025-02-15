import type * as SimpleWebAuthnServer from "@simplewebauthn/server";

const randomCredential = crypto.randomUUID();

export const { generateRegistrationOptions, generateAuthenticationOptions } =
  await vi.importActual<typeof SimpleWebAuthnServer>("@simplewebauthn/server");

export const verifyRegistrationResponse = async (
  options: SimpleWebAuthnServer.VerifyRegistrationResponseOpts,
): Promise<SimpleWebAuthnServer.VerifiedRegistrationResponse> => {
  const { challenge } = JSON.parse(
    Buffer.from(options.response.response.clientDataJSON, "base64url").toString("ascii"),
  );
  if (typeof options.expectedChallenge === "function") {
    if (!(await options.expectedChallenge(challenge))) {
      throw new Error(`Custom challenge verifier returned false for registration response challenge "${challenge}"`);
    }
  }
  return Promise.resolve({
    verified:
      (JSON.parse(Buffer.from(options.response.response.clientDataJSON, "base64url").toString("ascii")).origin ===
        options.expectedOrigin &&
        options.expectedOrigin.includes(`${process.env.FQDN}`) &&
        options.expectedRPID !== undefined &&
        options.expectedRPID.includes(process.env.DOMAIN) &&
        Buffer.from(options.response.response.attestationObject, "base64url").toString() ===
          "Valid Attestation Object" &&
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

export const verifyAuthenticationResponse = async (
  options: SimpleWebAuthnServer.VerifyAuthenticationResponseOpts,
): Promise<SimpleWebAuthnServer.VerifiedAuthenticationResponse> => {
  const { challenge } = JSON.parse(
    Buffer.from(options.response.response.clientDataJSON, "base64url").toString("ascii"),
  );
  if (typeof options.expectedChallenge === "function") {
    if (!(await options.expectedChallenge(challenge))) {
      throw new Error(`Custom challenge verifier returned false for authentication response challenge "${challenge}"`);
    }
  }
  return Promise.resolve({
    verified:
      (JSON.parse(Buffer.from(options.response.response.clientDataJSON, "base64url").toString("ascii")).origin ===
        options.expectedOrigin &&
        options.expectedOrigin.includes(`${process.env.FQDN}`) &&
        options.expectedRPID.includes(process.env.DOMAIN) &&
        options.requireUserVerification &&
        options.credential.id === options.response.id &&
        new TextDecoder().decode(options.credential.publicKey) === randomCredential &&
        Buffer.from(options.response.response.signature, "base64url").toString() === "Valid Signature") ??
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
