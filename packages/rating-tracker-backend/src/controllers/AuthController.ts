import { randomUUID } from "node:crypto";
import SimpleWebAuthnServer, {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
} from "@simplewebauthn/server";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { Buffer } from "node:buffer";
import { createSession } from "../redis/repositories/session/sessionRepository.js";
import APIError from "../utils/apiError.js";
import { createUser, readUserWithCredentials, updateUserWithCredentials, userExists } from "../db/tables/userTable.js";
import { sessionTTLInSeconds } from "../redis/repositories/session/sessionRepositoryBase.js";
import { GENERAL_ACCESS, optionalUserValuesNull, UserWithCredentials } from "rating-tracker-commons";

dotenv.config();

const rpName = "Rating Tracker";
// Using only the domain name allows us to use the same code for several subdomains.
const rpID = process.env.DOMAIN;
const origin = `https://${process.env.SUBDOMAIN ? process.env.SUBDOMAIN + "." : ""}${rpID}`;

// Stores all challenges between the client’s GET request to get such challenge and their POST request with the
// challenge response. Those are only required to be stored for a short time, so we can use a simple object here.
const currentChallenges = {};

/**
 * This class is responsible for handling all registration and authentication requests.
 */
class AuthController {
  /**
   * Generates a registration challenge for the user to register.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a response containing the registration challenge.
   * @throws an {@link APIError} if the user already exists.
   */
  async getRegistrationOptions(req: Request, res: Response) {
    const email = req.query.email;
    const name = req.query.name;
    // Users are required to provide an email address and a name to register.
    if (typeof email === "string" && typeof name === "string") {
      if (await userExists(email)) {
        throw new APIError(403, "This email address is already registered. Please sign in.");
      }
      // We generate the registration options and store the challenge for later verification.
      const options = SimpleWebAuthnServer.generateRegistrationOptions({
        rpName,
        rpID,
        userID: email,
        userName: name, // This will be displayed to the user when they authenticate.
        attestationType: "none", // Do not prompt users for additional information about the authenticator
        authenticatorSelection: {
          // Require the user to verify their identity with a PIN or biometric sensor, thereby using 2FA.
          userVerification: "required",
          // Enables the client to discover the key based on the RP ID provided in subsequent authentication requests.
          residentKey: "required",
        },
      });
      currentChallenges[email] = options.challenge;
      return res.status(200).json(options);
    }
  }

  // This function is not tested because it is difficult to mock creating a valid challenge response.
  /* istanbul ignore next -- @preserve */
  /**
   * Verifies the registration response and creates a new user if the request is valid.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a response with status code 201 if the registration was successful.
   * @throws an {@link APIError} if the registration failed or the user already exists.
   */
  async postRegistrationResponse(req: Request, res: Response) {
    const email = req.query.email;
    const name = req.query.name;
    // Users are required to provide an email address and a name to complete the registration.
    if (typeof email === "string" && typeof name === "string") {
      // We verify the registration response against the challenge we stored earlier.
      const expectedChallenge: string = currentChallenges[email];
      let verification: VerifiedRegistrationResponse;
      try {
        verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
          response: req.body,
          expectedChallenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
          requireUserVerification: true, // Require the user to verify their identity with a PIN or biometric sensor.
        });
      } catch (error) {
        throw new APIError(500, error.message);
      }

      const { verified } = verification; // If the verification was successful, this will hold true.
      const { registrationInfo } = verification;
      // The following information is required to verify the user’s identity in the future.
      // We store it in Redis.
      const { credentialPublicKey, credentialID, counter } = registrationInfo;
      if (
        verified &&
        // We attempt to create a new user with the provided information.
        // If the user already exists, createUser(…)  will return false and we throw an error.
        !(await createUser(
          new UserWithCredentials({
            ...optionalUserValuesNull,
            email,
            name,
            accessRights: 0, // Users need to be manually approved before they can access the app.
            credentialID: Buffer.from(credentialID).toString("base64"),
            credentialPublicKey: Buffer.from(credentialPublicKey).toString("base64"),
            counter,
          })
        ))
      ) {
        throw new APIError(403, "This email address is already registered. Please sign in.");
      }
      if (verified) {
        return res.status(201).end();
      }
      // We do not provide too much information about the error to the user.
      throw new APIError(400, "Registration failed");
    }
  }

  /**
   * Generates an authentication challenge for any user to sign in. The challenge is not related to any specific user.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a response containing the authentication challenge.
   */
  getAuthenticationOptions(req: Request, res: Response) {
    const options = SimpleWebAuthnServer.generateAuthenticationOptions({
      rpID: rpID,
      userVerification: "required", // Require the user to verify their identity with a PIN or biometric sensor.
    });
    currentChallenges[options.challenge] = options.challenge;
    return res.status(200).json(options);
  }

  // This function is not tested because it is difficult to mock creating a valid challenge response.
  /* istanbul ignore next -- @preserve */
  /**
   * Verifies the authentication response and creates a session cookie if the challenge response is valid.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a response with status code 204 and the session cookie set if the authentication was
   * successful.
   * @throws an {@link APIError} if the authentication failed or the user lacks access rights.
   */
  async postAuthenticationResponse(req: Request, res: Response) {
    // We retrieve the user from Redis, who we identified by the email address in the challenge response.
    const email = req.body.response.userHandle;
    const user = await readUserWithCredentials(email);

    let verification: VerifiedAuthenticationResponse;
    try {
      verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
        response: req.body,
        // We verify the authentication response against the challenge we stored earlier.
        expectedChallenge: currentChallenges[req.body.challenge],
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          // This information is stored for each user in Redis.
          credentialID: Buffer.from(user.credentialID, "base64"),
          credentialPublicKey: Buffer.from(user.credentialPublicKey, "base64"),
          counter: user.counter,
        },
        requireUserVerification: true, // Require the user to verify their identity with a PIN or biometric sensor.
      });
    } catch (error) {
      throw new APIError(500, error.message);
    }

    const { verified } = verification; // If the verification was successful, this will hold true.
    const { authenticationInfo } = verification;
    const { newCounter } = authenticationInfo;
    if (verified) {
      // We use bitwise AND to check if the user has the GENERAL_ACCESS bit set.
      if (!user.hasAccessRight(GENERAL_ACCESS)) {
        throw new APIError(403, "This user account is not yet activated.");
      }
      // The counter variable will increment if the client’s authenticator tracks the number of authentications.
      // Not supported by all authenticators.
      await updateUserWithCredentials(email, { counter: newCounter });

      // We create and store a session cookie for the user.
      const authToken = randomUUID();
      await createSession({ sessionID: authToken, email });
      res.cookie("authToken", authToken, {
        maxAge: 1000 * sessionTTLInSeconds, // Refresh the cookie on the client
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development", // allow plain HTTP in development
        sameSite: true,
      });
      return res.status(204).end();
    }
    throw new APIError(400, "Authentication failed");
  }
}

export default new AuthController();
