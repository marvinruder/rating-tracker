import {
  ALREADY_REGISTERED_ERROR_MESSAGE,
  GENERAL_ACCESS,
  optionalUserValuesNull,
  User,
} from "@rating-tracker/commons";
import * as WebAuthn from "@simplewebauthn/server";

import type DBService from "../db/db.service";
import type SessionService from "../session/session.service";
import type UserService from "../user/user.service";
import ConflictError from "../utils/error/api/ConflictError";
import ForbiddenError from "../utils/error/api/ForbiddenError";
import NotFoundError from "../utils/error/api/NotFoundError";
import UnauthorizedError from "../utils/error/api/UnauthorizedError";
import UnprocessableContentError from "../utils/error/api/UnprocessableContentError";

/**
 * This service provides methods to register and authenticate users via the WebAuthn standard.
 */
class WebAuthnService {
  constructor(
    dbService: DBService,
    private sessionService: SessionService,
    private userService: UserService,
  ) {
    const { webAuthnCredential } = dbService;
    this.db = { webAuthnCredential };
  }

  /**
   * A service that provides access to the database.
   */
  private db: Pick<DBService, "webAuthnCredential">;

  /**
   * Stores all challenges between the client’s GET request to get such challenge and their POST request with the
   * challenge response. Those are only required to be stored for a short time, so we can use a simple object here.
   */
  #currentChallenges: Record<string, string> = {};

  // In the future, one might want to store the challenges in a database using the following schema:
  // model WebAuthnChallenge {
  //   challenge Bytes    @id @default(dbgenerated("gen_random_bytes(32)"))
  //   email     String?  @db.VarChar(255)
  //   expiresAt DateTime @default(dbgenerated("date_add(now(), '60 seconds')")) @db.Timestamp(6)
  // }

  /**
   * The Relying Party name.
   */
  #rpName = "Rating Tracker";
  /**
   * The Relying Party ID. Using only the domain name allows us to use the same code for several subdomains.
   */
  #rpID = process.env.DOMAIN;
  /**
   * The expected origin of WebAuthn-related requests.
   */
  #origin = `https://${process.env.SUBDOMAIN ? `${process.env.SUBDOMAIN}.` : ""}${this.#rpID}`;

  /**
   * Read a WebAuthn credential, identified by its ID, and include the associated user.
   * @param credentialID The base64url-encoded ID of the credential.
   * @returns The credential including the associated user.
   * @throws an {@link APIError} if the credential does not exist.
   */
  async #readCredentialWithUser(credentialID: string) {
    // Decode base64url (as specified in https://www.w3.org/TR/webauthn-2/)
    const credentialIDBuffer = Buffer.from(credentialID, "base64url");
    try {
      const credential = await this.db.webAuthnCredential.findUniqueOrThrow({
        where: { id: credentialIDBuffer },
        select: { id: true, publicKey: true, counter: true, user: true },
      });
      return { ...credential, user: new User(credential.user) };
    } catch {
      throw new NotFoundError(`User with credential ${credentialID} not found.`);
    }
  }

  /**
   * Generates a WebAuthn registration challenge for a user to register.
   * @param name The name of the user.
   * @param email The email address of the user.
   * @returns The registration options, to be sent to the client.
   */
  async generateRegistrationOptions(
    name: string,
    email: string,
  ): Promise<ReturnType<typeof WebAuthn.generateRegistrationOptions>> {
    // Check if the user already exists
    if (await this.userService.exists(email)) {
      throw new ConflictError(ALREADY_REGISTERED_ERROR_MESSAGE);
    }

    // We generate the registration options and store the challenge for later verification.
    const options = await WebAuthn.generateRegistrationOptions({
      rpName: this.#rpName,
      rpID: this.#rpID,
      userName: name, // This will be displayed to the user when they authenticate.
      attestationType: "none", // Do not require attestation, as we do not need to verify the authenticator.
      authenticatorSelection: {
        // Require the user to verify their identity with a PIN or biometric sensor, thereby using 2FA.
        userVerification: "required",
        // Enables the client to discover the key based on the RP ID provided in subsequent authentication requests.
        residentKey: "required",
      },
    });
    this.#currentChallenges[email] = options.challenge;
    return options;
  }

  /**
   * Verifies a WebAuthn registration response and stores the user in the database.
   * @param name The name of the user.
   * @param email The email address of the user.
   * @param response The response received from the client.
   */
  async verifyRegistrationResponse(
    name: string,
    email: string,
    response: WebAuthn.VerifyRegistrationResponseOpts["response"],
  ): Promise<void> {
    // We verify the registration response against the challenge we stored earlier.
    const expectedChallenge: string = this.#currentChallenges[email];
    let verification: WebAuthn.VerifiedRegistrationResponse;
    try {
      verification = await WebAuthn.verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: this.#origin,
        expectedRPID: this.#rpID,
        requireUserVerification: true, // Require the user to verify their identity with a PIN or biometric sensor.
      });
    } catch (e) {
      throw new UnprocessableContentError(e instanceof Error ? e.message : String(e));
    }

    const { verified, registrationInfo } = verification;

    // We do not provide too much information about the error to the user.
    if (!verified || !registrationInfo) throw new UnauthorizedError("Registration failed");

    // The following information is required to verify the user’s identity in the future.
    // We store it in the database.
    const { credentialPublicKey, credentialID, counter } = registrationInfo;
    if (
      verified && // If the verification was successful, this will hold true.
      // We attempt to create a new user with the provided information.
      // If the user already exists, create(…)  will return false and we throw an error.
      !(await this.userService.create(
        // Users need to be manually approved before they can access the app.
        new User({ ...optionalUserValuesNull, email, name, accessRights: 0 }),
        // Decode base64url (as specified in https://www.w3.org/TR/webauthn-2/)
        { id: Buffer.from(credentialID, "base64url"), publicKey: credentialPublicKey, counter },
      ))
    ) {
      throw new ConflictError(ALREADY_REGISTERED_ERROR_MESSAGE);
    }
  }

  /**
   * Generates a WebAuthn authentication challenge for a user to sign in.
   * @returns The authentication options, to be sent to the client.
   */
  async generateAuthenticationOptions(): Promise<ReturnType<typeof WebAuthn.generateAuthenticationOptions>> {
    const options = await WebAuthn.generateAuthenticationOptions({
      rpID: this.#rpID,
      userVerification: "required", // Require the user to verify their identity with a PIN or biometric sensor.
    });
    this.#currentChallenges[options.challenge] = options.challenge;
    return options;
  }

  /**
   * Verifies a WebAuthn authentication response.
   * @param response The response received from the client.
   * @returns The session ID created for the user who signed in.
   */
  async verifyAuthenticationResponse(response: WebAuthn.VerifyAuthenticationResponseOpts["response"]): Promise<string> {
    // We retrieve the user from the database, who we identified by the email address in the challenge response.
    const credentialID: string = response.id;
    const credential = await this.#readCredentialWithUser(credentialID);
    const { user } = credential;

    let verification: WebAuthn.VerifiedAuthenticationResponse;
    try {
      const { challenge } = JSON.parse(Buffer.from(response.response.clientDataJSON, "base64url").toString());
      verification = await WebAuthn.verifyAuthenticationResponse({
        response,
        // We verify the authentication response against the challenge we stored earlier.
        expectedChallenge: this.#currentChallenges[challenge],
        expectedOrigin: this.#origin,
        expectedRPID: this.#rpID,
        authenticator: {
          // This information is stored for each user in the database.
          credentialID: credential.id.toString("base64url"),
          credentialPublicKey: credential.publicKey,
          counter: credential.counter,
        },
        requireUserVerification: true, // Require the user to verify their identity with a PIN or biometric sensor.
      });
    } catch (e) {
      throw new UnprocessableContentError(e instanceof Error ? e.message : String(e));
    }

    const { verified, authenticationInfo } = verification;
    const { newCounter } = authenticationInfo;

    // If the verification was successful, `verified` will hold true.
    // If not, we do not provide too much information about the error to the user.
    if (!verified) throw new UnauthorizedError("Authentication failed");

    // We check if the user has the GENERAL_ACCESS bit set.
    if (!user.hasAccessRight(GENERAL_ACCESS)) throw new ForbiddenError("This user account is not yet activated.");

    // The counter variable will increment if the client’s authenticator tracks the number of authentications.
    // Not supported by all authenticators.
    await this.db.webAuthnCredential.update({
      where: { id: Buffer.from(credentialID, "base64url") },
      data: { counter: newCounter },
    });

    return await this.sessionService.create(user.email);
  }
}

export default WebAuthnService;
