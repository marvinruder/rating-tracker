import * as SimpleWebAuthnServer from "@simplewebauthn/server";
import { randomUUID } from "crypto";

const randomCredential = randomUUID();

export const { generateRegistrationOptions, generateAuthenticationOptions } =
  await vi.importActual<typeof SimpleWebAuthnServer>("@simplewebauthn/server");

export const verifyRegistrationResponse = (options: SimpleWebAuthnServer.VerifyRegistrationResponseOpts) => {
  if (options.response.id !== options.response.rawId) {
    // One of the errors that can be thrown by the actual implementation.
    throw new Error("Credential ID was not base64url-encoded");
  }
  return Promise.resolve({
    verified:
      JSON.parse(Buffer.from(options.response.response.clientDataJSON, "base64").toString("ascii")).challenge ===
        options.expectedChallenge &&
      JSON.parse(Buffer.from(options.response.response.clientDataJSON, "base64").toString("ascii")).origin ===
        options.expectedOrigin &&
      options.expectedOrigin.includes(`${process.env.SUBDOMAIN}.${process.env.DOMAIN}`) &&
      options.expectedRPID.includes(process.env.DOMAIN) &&
      options.requireUserVerification,
    registrationInfo: {
      credentialID: Buffer.from(options.response.id, "base64").toString("ascii"),
      credentialPublicKey: Buffer.from(`${randomCredential}`),
      counter: 0,
    },
  });
};

export const verifyAuthenticationResponse = (options: SimpleWebAuthnServer.VerifyAuthenticationResponseOpts) => {
  if (options.response.id !== options.response.rawId) {
    // One of the errors that can be thrown by the actual implementation.
    throw new Error("Credential ID was not base64url-encoded");
  }
  return Promise.resolve({
    verified:
      JSON.parse(Buffer.from(options.response.response.clientDataJSON, "base64").toString("ascii")).challenge ===
        options.expectedChallenge &&
      JSON.parse(Buffer.from(options.response.response.clientDataJSON, "base64").toString("ascii")).origin ===
        options.expectedOrigin &&
      // options.response.challenge === options.expectedChallenge &&
      options.expectedOrigin.includes(`${process.env.SUBDOMAIN}.${process.env.DOMAIN}`) &&
      options.expectedRPID.includes(process.env.DOMAIN) &&
      options.requireUserVerification &&
      options.authenticator.credentialID.toString() === Buffer.from(options.response.id, "base64").toString("ascii") &&
      options.authenticator.credentialPublicKey.toString() === `${randomCredential}`,
    authenticationInfo: {
      newCounter: options.authenticator.counter + 1,
    },
  });
};
