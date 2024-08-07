import { Buffer } from "node:buffer";

import {
  ALREADY_REGISTERED_ERROR_MESSAGE,
  authAPIPath,
  GENERAL_ACCESS,
  optionalUserValuesNull,
  registerEndpointSuffix,
  signInEndpointSuffix,
  User,
} from "@rating-tracker/commons";
import * as SimpleWebAuthnServer from "@simplewebauthn/server";
import type { Request, RequestHandler, Response } from "express";
import express from "express";

import { createSession, SESSION_TTL } from "../db/tables/sessionTable";
import { createUser, readCredentialWithUser, setCredentialCounter, userExists } from "../db/tables/userTable";
import * as user from "../openapi/parameters/user";
import { badRequest, forbidden, notFound, tooManyRequestsHTML } from "../openapi/responses/clientError";
import { internalServerError } from "../openapi/responses/serverError";
import { created, noContent, okObject } from "../openapi/responses/success";
import APIError from "../utils/APIError";
import Endpoint from "../utils/Endpoint";

import SingletonController from "./SingletonController";

/**
 * This class is responsible for handling all registration and authentication requests.
 */
class AuthController extends SingletonController {
  path = authAPIPath;
  tags = ["Authentication API"];

  /**
   * Stores all challenges between the client’s GET request to get such challenge and their POST request with the
   * challenge response. Those are only required to be stored for a short time, so we can use a simple object here.
   */
  #currentChallenges: Record<string, string> = {};

  #rpName = "Rating Tracker";
  // Using only the domain name allows us to use the same code for several subdomains.
  #rpID = process.env.DOMAIN;
  #origin = `https://${process.env.SUBDOMAIN ? process.env.SUBDOMAIN + "." : ""}${this.#rpID}`;

  /**
   * Generates a registration challenge for the user to register via the WebAuthn standard.
   * @param req Request object
   * @param res Response object
   * @throws an {@link APIError} if the user already exists.
   */
  @Endpoint({
    spec: {
      summary: "Get a challenge for registering a new user",
      description: "Generates a registration challenge for the user to register via the WebAuthn standard",
      parameters: [
        { ...user.email, required: true },
        { ...user.name, required: true },
      ],
      responses: { "200": okObject, "403": forbidden, "429": tooManyRequestsHTML },
    },
    method: "get",
    path: registerEndpointSuffix,
    accessRights: 0,
    rateLimited: true,
  })
  getRegistrationOptions: RequestHandler = async (req: Request, res: Response) => {
    const email = req.query.email;
    const name = req.query.name;
    // Users are required to provide an email address and a name to register.
    if (typeof email !== "string" || typeof name !== "string") throw new APIError(400, "Invalid query parameters.");
    if (await userExists(email)) {
      throw new APIError(403, ALREADY_REGISTERED_ERROR_MESSAGE);
    }
    // We generate the registration options and store the challenge for later verification.
    const options = await SimpleWebAuthnServer.generateRegistrationOptions({
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
    res.status(200).json(options).end();
  };

  /**
   * Verifies the registration response and creates a new user if the request is valid.
   * @param req Request object
   * @param res Response object
   * @throws an {@link APIError} if the registration failed or the user already exists.
   */
  @Endpoint({
    spec: {
      summary: "Verify the response for a WebAuthn registration challenge",
      description: "Verifies the registration response and creates a new user if the request is valid.",
      parameters: [
        { ...user.email, required: true },
        { ...user.name, required: true },
      ],
      responses: {
        "201": created,
        "400": badRequest,
        "403": forbidden,
        "429": tooManyRequestsHTML,
        "500": internalServerError,
      },
    },
    method: "post",
    path: registerEndpointSuffix,
    accessRights: 0,
    bodyParser: express.json(),
    rateLimited: true,
  })
  postRegistrationResponse: RequestHandler = async (req: Request, res: Response) => {
    const email = req.query.email;
    const name = req.query.name;
    // Users are required to provide an email address and a name to complete the registration.
    if (typeof email !== "string" || typeof name !== "string") throw new APIError(400, "Invalid query parameters.");
    // We verify the registration response against the challenge we stored earlier.
    const expectedChallenge: string = this.#currentChallenges[email];
    let verification: SimpleWebAuthnServer.VerifiedRegistrationResponse;
    try {
      verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
        response: req.body,
        expectedChallenge,
        expectedOrigin: this.#origin,
        expectedRPID: this.#rpID,
        requireUserVerification: true, // Require the user to verify their identity with a PIN or biometric sensor.
      });
    } catch (e) {
      throw new APIError(500, e.message);
    }

    const { verified, registrationInfo } = verification;
    // The following information is required to verify the user’s identity in the future.
    // We store it in the database.
    const { credentialPublicKey, credentialID, counter } = registrationInfo;
    if (
      verified && // If the verification was successful, this will hold true.
      // We attempt to create a new user with the provided information.
      // If the user already exists, createUser(…)  will return false and we throw an error.
      !(await createUser(
        // Users need to be manually approved before they can access the app.
        new User({ ...optionalUserValuesNull, email, name, accessRights: 0 }),
        // Decode base64url (as specified in https://www.w3.org/TR/webauthn-2/)
        { id: Buffer.from(credentialID, "base64url"), publicKey: credentialPublicKey, counter },
      ))
    ) {
      throw new APIError(403, ALREADY_REGISTERED_ERROR_MESSAGE);
    }
    if (verified) res.status(201).end();
    // We do not provide too much information about the error to the user.
    else throw new APIError(400, "Registration failed");
  };

  /**
   * Generates an authentication challenge for any user to sign in. The challenge is not related to any specific user.
   * @param _ Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      summary: "Get a challenge for authenticating as a registered user",
      description:
        "Generates an authentication challenge for any user to sign in. " +
        "The challenge is not related to any specific user.",
      responses: { "200": okObject, "429": tooManyRequestsHTML },
    },
    method: "get",
    path: signInEndpointSuffix,
    accessRights: 0,
    rateLimited: true,
  })
  getAuthenticationOptions: RequestHandler = async (_: Request, res: Response) => {
    const options = await SimpleWebAuthnServer.generateAuthenticationOptions({
      rpID: this.#rpID,
      userVerification: "required", // Require the user to verify their identity with a PIN or biometric sensor.
    });
    this.#currentChallenges[options.challenge] = options.challenge;
    res.status(200).json(options).end();
  };

  /**
   * Verifies the authentication response and creates a session cookie if the challenge response is valid.
   * @param req Request object
   * @param res Response object
   * @throws an {@link APIError} if the authentication failed or the user lacks access rights.
   */
  @Endpoint({
    spec: {
      summary: "Verify the response for a WebAuthn authentication challenge",
      description:
        "Verifies the authentication response and creates a session cookie if the challenge response is valid.",
      responses: {
        "204": noContent,
        "400": badRequest,
        "403": forbidden,
        "404": notFound,
        "429": tooManyRequestsHTML,
        "500": internalServerError,
      },
    },
    method: "post",
    path: signInEndpointSuffix,
    accessRights: 0,
    bodyParser: express.json(),
    rateLimited: true,
  })
  postAuthenticationResponse: RequestHandler = async (req: Request, res: Response) => {
    // We retrieve the user from the database, who we identified by the email address in the challenge response.
    const credentialID: string = req.body.id;
    const credential = await readCredentialWithUser(credentialID);
    const { user } = credential;

    let verification: SimpleWebAuthnServer.VerifiedAuthenticationResponse;
    try {
      verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
        response: req.body,
        // We verify the authentication response against the challenge we stored earlier.
        expectedChallenge: this.#currentChallenges[req.body.challenge],
        expectedOrigin: this.#origin,
        expectedRPID: this.#rpID,
        authenticator: {
          // This information is stored for each user in the database.
          credentialID: Buffer.from(credential.id).toString("base64"),
          credentialPublicKey: credential.publicKey,
          counter: credential.counter,
        },
        requireUserVerification: true, // Require the user to verify their identity with a PIN or biometric sensor.
      });
    } catch (e) {
      throw new APIError(500, e.message);
    }

    const { verified, authenticationInfo } = verification;
    const { newCounter } = authenticationInfo;
    // If the verification was successful, this will hold true.
    if (verified) {
      // We use bitwise AND to check if the user has the GENERAL_ACCESS bit set.
      if (!user.hasAccessRight(GENERAL_ACCESS)) {
        throw new APIError(403, "This user account is not yet activated.");
      }
      // The counter variable will increment if the client’s authenticator tracks the number of authentications.
      // Not supported by all authenticators.
      await setCredentialCounter(credential.id, newCounter);

      // We create and store a session cookie for the user.
      res.cookie("id", await createSession(user.email), {
        maxAge: 1000 * SESSION_TTL, // Refresh the cookie on the client
        httpOnly: true,
        secure: true,
        sameSite: true,
      });
      res.status(204).end();
      // We do not provide too much information about the error to the user.
    } else throw new APIError(400, "Authentication failed");
  };
}

export default new AuthController();
