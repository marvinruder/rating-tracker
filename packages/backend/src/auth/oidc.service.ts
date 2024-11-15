import {
  GENERAL_ACCESS,
  WRITE_STOCKS_ACCESS,
  ADMINISTRATIVE_ACCESS,
  optionalUserValuesNull,
  User,
  REGEX_PHONE_NUMBER,
} from "@rating-tracker/commons";
import * as jmespath from "jmespath";
import * as oidc from "oauth4webapi";

import type SessionService from "../session/session.service";
import type UserService from "../user/user.service";
import ForbiddenError from "../utils/error/api/ForbiddenError";
import NotImplementedError from "../utils/error/api/NotImplementedError";
import ServiceUnavailableError from "../utils/error/api/ServiceUnavailableError";
import UnauthorizedError from "../utils/error/api/UnauthorizedError";
import Logger from "../utils/logger";

/**
 * This service provides methods to register and authenticate users via the OpenID Connect standard.
 */
class OIDCService {
  constructor(
    private sessionService: SessionService,
    private userService: UserService,
  ) {}

  /**
   * The authorization server metadata.
   */
  #authorizationServer: oidc.AuthorizationServer | null | undefined = undefined;

  /**
   * The redirect URI for the OpenID Connect provider.
   */
  #redirectURI = `https://${process.env.FQDN}/login`;

  /**
   * Fetches the metadata from the authorization server and caches it indefinitely.
   */
  async #fetchMetadata(): Promise<void> {
    if (process.env.OIDC_ISSUER_URL && process.env.OIDC_CLIENT_ID && process.env.OIDC_CLIENT_SECRET) {
      try {
        const oidcIssuerURL = new URL(process.env.OIDC_ISSUER_URL);
        const response = await oidc.discoveryRequest(oidcIssuerURL, { algorithm: "oidc" });
        this.#authorizationServer = await oidc.processDiscoveryResponse(oidcIssuerURL, response);
        Logger.info({ component: "oidc" }, "Retrieved OpenID Connect server metadata.");
      } catch (e) {
        /* c8 ignore next 6 */ // We mock a successful response in the tests
        this.#authorizationServer = null;
        Logger.error({ component: "oidc", err: e }, "Failed to retrieve OpenID Connect server metadata.");
      }
    } else {
      this.#authorizationServer = undefined;
    }
  }

  /**
   * Returns the metadata from the authorization server. If no metadata is cached, it attempts to fetch it one time.
   */
  async #getMetadata(): Promise<oidc.AuthorizationServer> {
    if (!this.#authorizationServer) await this.#fetchMetadata();
    switch (this.#authorizationServer) {
      case null:
        /* c8 ignore next */ // We mock a working OpenID Connect server in the tests
        throw new ServiceUnavailableError("Unable to fetch the OpenID Connect server metadata.");
      case undefined:
        /* c8 ignore next */ // We mock a working OpenID Connect server in the tests
        throw new NotImplementedError("No OpenID Connect provider is configured.");
      default:
        return this.#authorizationServer;
    }
  }

  /**
   * Returns the OpenID Connect provider's authorization URL including the necessary parameters.
   */
  async getAuthorizationURL(): Promise<{ authorizationURL: URL; codeVerifier: string }> {
    const authorizationServer = await this.#getMetadata();

    // Code verifier and nonce MUST be generated for every redirect to the authorization endpoint.
    // We must store the code verifier and nonce in the end-user session such that it can be recovered as the user gets
    // redirected from the authorization server back to our application.
    const codeVerifier = oidc.generateRandomCodeVerifier();

    const authorizationURL = new URL(authorizationServer.authorization_endpoint!);
    authorizationURL.searchParams.set("client_id", process.env.OIDC_CLIENT_ID!);
    authorizationURL.searchParams.set("redirect_uri", this.#redirectURI);
    authorizationURL.searchParams.set("response_type", "code");
    authorizationURL.searchParams.set("scope", process.env.OIDC_SCOPES);
    authorizationURL.searchParams.set("code_challenge", await oidc.calculatePKCECodeChallenge(codeVerifier));
    authorizationURL.searchParams.set("code_challenge_method", "S256");

    // We cannot be sure the Authorization Server supports PKCE so we are going to use nonce too. Use of PKCE is
    // backwards compatible even if the Authorization Server does not support it which is why we are using it
    // regardless.
    if (!authorizationServer.code_challenge_methods_supported?.includes("S256"))
      authorizationURL.searchParams.set("nonce", oidc.generateRandomNonce());

    return { authorizationURL, codeVerifier };
  }

  /**
   * Returns the OpenID Connect provider's front-channel logout URI including the necessary parameters.
   * @param oidcIDToken The OpenID Connect ID token of the user.
   * @returns The front-channel logout URL, or `null` if the OpenID Connect provider does not support front-channel
   *          logout.
   */
  async getFrontchannelLogoutURI(oidcIDToken: string): Promise<URL | null> {
    const authorizationServer = await this.#getMetadata();

    // If the OpenID Connect provider does not support front-channel logout, we have no URL to return.
    if (!authorizationServer.frontchannel_logout_supported || !authorizationServer.end_session_endpoint) return null;

    const logoutURL = new URL(authorizationServer.end_session_endpoint);
    logoutURL.searchParams.set("client_id", process.env.OIDC_CLIENT_ID!);
    logoutURL.searchParams.set("id_token_hint", oidcIDToken);
    logoutURL.searchParams.set("post_logout_redirect_uri", `https://${process.env.FQDN}/login?origin=oidc_post_logout`);

    return logoutURL;
  }

  /**
   * Handles the callback from the OpenID Connect provider.
   * @param email The email of the current user, or `undefined` if no user is signed in.
   * @param searchParams The search parameters of the callback URL.
   * @param codeVerifier The code verifier generated during the authorization URL creation.
   * @param expectedNonce The nonce generated during the authorization URL creation.
   * @returns The session ID created for the user who signed in, or `null` if a user is already signed in.
   */
  async handleCallback(
    email: string | undefined,
    searchParams: URLSearchParams,
    codeVerifier: string,
    expectedNonce?: string,
  ): Promise<string | null> {
    const authorizationServer = await this.#getMetadata();
    const client = { client_id: process.env.OIDC_CLIENT_ID! };
    const clientAuth = oidc.ClientSecretPost(process.env.OIDC_CLIENT_SECRET!);

    const params = oidc.validateAuthResponse(authorizationServer, client, searchParams);

    const authorizationCodeResponse = await oidc.authorizationCodeGrantRequest(
      authorizationServer,
      client,
      clientAuth,
      params,
      this.#redirectURI,
      codeVerifier,
    );
    const tokenResult = await oidc.processAuthorizationCodeResponse(
      authorizationServer,
      client,
      authorizationCodeResponse,
      { expectedNonce, requireIdToken: true },
    );

    const claims = oidc.getValidatedIdTokenClaims(tokenResult)!;

    const userInfoResponse = await oidc.userInfoRequest(authorizationServer, client, tokenResult.access_token);
    const userInfoResult = await oidc.processUserInfoResponse(
      authorizationServer,
      client,
      claims.sub,
      userInfoResponse,
    );

    if (email)
      // Connect the OpenID Connect subject to the user who is currently signed in.
      await this.userService.addOIDCIdentity(email, {
        sub: userInfoResult.sub,
        preferredUsername: userInfoResult.preferred_username ?? userInfoResult.name ?? userInfoResult.sub,
      });

    let user: User;
    try {
      // Check whether the subject is already associated with a user in the database.
      user = await this.userService.readByOIDCSub(userInfoResult.sub);
    } catch (e) {
      // If the user does not exist, but a verified email address is provided, we can create a new or connect an
      // existing user.
      if (!userInfoResult.email_verified || !userInfoResult.email)
        throw new UnauthorizedError("The OpenID Connect provider did not verify the user’s email address.");

      try {
        user = await this.userService.read(userInfoResult.email);
      } catch (e) {
        // If no user with the given verified email adress exists, we can create a new user.
        await this.userService.create(
          new User({
            ...optionalUserValuesNull,
            email: userInfoResult.email,
            name: userInfoResult.name ?? userInfoResult.sub,
            accessRights: 0,
          }),
        );
        user = await this.userService.read(userInfoResult.email);
      }
      // Connect the OpenID Connect subject to the existing or newly created user.
      await this.userService.addOIDCIdentity(user.email, {
        sub: userInfoResult.sub,
        preferredUsername: userInfoResult.preferred_username ?? userInfoResult.name ?? userInfoResult.sub,
      });
      user = await this.userService.readByOIDCSub(userInfoResult.sub);
    }

    // Extract the user information from the token claims.
    const newUserInfo: Partial<Omit<User, "oidcIdentity">> = {};
    if (userInfoResult.name) newUserInfo.name = userInfoResult.name;
    if (userInfoResult.email && userInfoResult.email_verified) newUserInfo.email = userInfoResult.email;
    if (userInfoResult.phone_number?.match(REGEX_PHONE_NUMBER)) newUserInfo.phone = userInfoResult.phone_number;

    if (process.env.OIDC_ROLE_CLAIM_PATH) {
      // A path to retrieve roles from the token claims is configured. We attempt to extract the roles.
      let roles: string[] | null;
      try {
        roles = jmespath.search(claims, process.env.OIDC_ROLE_CLAIM_PATH);
      } catch (e) {
        /* c8 ignore next 2 */ // We have not yet encountered a situation where this error is thrown
        roles = null;
      }

      if (Array.isArray(roles)) {
        // Roles are found in the token claims. We set the access rights according to the roles.
        newUserInfo.accessRights = Object.entries({
          GENERAL_ACCESS,
          WRITE_STOCKS_ACCESS,
          ADMINISTRATIVE_ACCESS,
        }).reduce((acc, [key, value]) => (roles.find((role) => role.toUpperCase() === key) ? acc | value : acc), 0);
      } else {
        // We cannot verify the user’s roles and reject the request.
        throw new UnauthorizedError("Unable to retrieve user roles from the OpenID Connect provider.");
      }
    }

    // Update the user’s preferred username.
    if (userInfoResult.preferred_username)
      await this.userService.updateOIDCIdentity(user.email, { preferredUsername: userInfoResult.preferred_username });
    // Update the user with the information from the token claims.
    await this.userService.update(user.email, newUserInfo);

    // Read the user again to get the updated information.
    user = await this.userService.read(newUserInfo.email ?? user.email);

    // We check if the user has the GENERAL_ACCESS bit set.
    if (!user.hasAccessRight(GENERAL_ACCESS)) throw new ForbiddenError("This user account is not yet activated.");

    return email ? null : await this.sessionService.create(user.email, tokenResult.id_token);
  }

  /**
   * Checks if the OpenID Connect provider is configured and its metadata is available.
   * @returns A {@link Promise} that resolves with the configuration status of the OpenID Connect provider, or rejects
   *          with an error if it is configured but the metadata is not available.
   */
  getStatus(): Promise<string> {
    return this.#getMetadata()
      .then(() => "Configured")
      .catch((e) => {
        /* c8 ignore next 2 */ // We mock a working OpenID Connect server in the tests
        if (e instanceof NotImplementedError) return "Not configured";
        return Promise.reject(e);
      });
  }
}

export default OIDCService;
