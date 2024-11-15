import {
  ALREADY_REGISTERED_ERROR_MESSAGE,
  basePath,
  registerEndpointSuffix,
  signInEndpointSuffix,
  accountAPIPath,
  usersAPIPath,
  authAPIPath,
  oidcEndpointSuffix,
} from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Authentication API";

export const tests: LiveTestSuite = [];

const BASE_64_ID = Buffer.from("ID").toString("base64url");

tests.push({
  testName: "[unsafe] registers and authenticates a new user",
  testFunction: async () => {
    // Get Registration Challenge
    let res = await app.request(
      `${basePath}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("jim.doe@example.com")}&name=${encodeURIComponent("Jim Doe")}`,
    );
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(typeof body.challenge).toBe("string");
    expect(typeof body.timeout).toBe("number");
    expect(body.rp.id).toBe(`${process.env.DOMAIN}`);
    expect(body.rp.name).toMatch("Rating Tracker");
    expect(body.user.name).toBe("Jim Doe");
    expect(body.attestation).toBe("none");
    expect(body.excludeCredentials).toHaveLength(0);
    expect(body.authenticatorSelection.userVerification).toBe("required");
    expect(body.authenticatorSelection.residentKey).toBe("required");
    expect(body.authenticatorSelection.requireResidentKey).toBeTruthy();

    let challenge = body.challenge;
    let response = {
      clientDataJSON: Buffer.from(
        JSON.stringify({ type: "webauthn.create", challenge, origin: `https://${process.env.FQDN}` }),
      ).toString("base64url"),
      attestationObject: Buffer.from("Attestation Object").toString("base64url"),
    } as object;

    // Post Registration Response
    res = await app.request(
      `${basePath}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("jim.doe@example.com")}&name=${encodeURIComponent("Jim Doe")}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: BASE_64_ID,
          rawId: "ID",
          response,
          clientExtensionResults: {},
          type: "public-key",
        }),
      },
    );
    body = await res.json();
    expect(res.status).toBe(422); // Unprocessable Content
    expect(body.message).toMatch("Credential ID was not base64url-encoded");

    res = await app.request(
      `${basePath}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("jim.doe@example.com")}&name=${encodeURIComponent("Jim Doe")}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: BASE_64_ID,
          rawId: BASE_64_ID,
          response: {
            ...response,
            clientDataJSON: Buffer.from(
              JSON.stringify({
                type: "webauthn.create",
                challenge: "Wrong challenge", // Oh no!
                origin: `https://${process.env.FQDN}`,
              }),
            ).toString("base64url"),
          },
          clientExtensionResults: {},
          type: "public-key",
        }),
      },
    );
    body = await res.json();
    expect(res.status).toBe(401); // Unauthorized
    expect(body.message).toMatch("Registration failed");

    res = await app.request(
      `${basePath}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("jim.doe@example.com")}&name=${encodeURIComponent("Jim Doe")}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: BASE_64_ID,
          rawId: BASE_64_ID,
          response,
          clientExtensionResults: {},
          type: "public-key",
        }),
      },
    );
    expect(res.status).toBe(201); // Successful registration

    res = await app.request(
      `${basePath}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("jim.doe@example.com")}&name=${encodeURIComponent("Jim Doe")}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: BASE_64_ID,
          rawId: BASE_64_ID,
          response,
          clientExtensionResults: {},
          type: "public-key",
        }),
      },
    );
    expect(res.status).toBe(409); // Hey, we have done that already!

    // Get Authentication Challenge
    res = await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`);
    body = await res.json();
    expect(res.status).toBe(200);
    expect(typeof body.challenge).toBe("string");
    expect(typeof body.timeout).toBe("number");
    expect(body.rpId).toBe(`${process.env.DOMAIN}`);
    expect(body.userVerification).toBe("required");

    challenge = body.challenge;
    response = {
      clientDataJSON: Buffer.from(
        JSON.stringify({ type: "webauthn.get", challenge, origin: `https://${process.env.FQDN}` }),
      ).toString("base64url"),
      authenticatorData: Buffer.from("Authenticator Data").toString("base64url"),
      signature: Buffer.from("Signature").toString("base64url"),
      userHandle: "jim.doe@example.com",
    };

    // Post Authentication Response
    res = await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: BASE_64_ID,
        rawId: "ID",
        response,
        clientExtensionResults: {},
        type: "public-key",
        challenge,
      }),
    });
    body = await res.json();
    expect(res.status).toBe(422); // Unprocessable Content
    expect(body.message).toMatch("Credential ID was not base64url-encoded");
    expect(res.headers.get("set-cookie")).toBeNull(); // no session cookie yet

    res = await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: "ID", // not base64url-encoded -- no existing user with that ID
        rawId: "ID",
        response,
        clientExtensionResults: {},
        type: "public-key",
        challenge,
      }),
    });
    body = await res.json();
    expect(res.status).toBe(404); // Not found
    expect(body.message).toMatch("User with credential ID not found");
    expect(res.headers.get("set-cookie")).toBeNull(); // no session cookie yet

    res = await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: BASE_64_ID,
        rawId: BASE_64_ID,
        response: {
          ...response,
          clientDataJSON: Buffer.from(
            JSON.stringify({
              type: "webauthn.get",
              challenge: "Wrong challenge", // Oh no!
              origin: `https://${process.env.FQDN}`,
            }),
          ).toString("base64url"),
        },
        clientExtensionResults: {},
        type: "public-key",
        challenge: "Wrong challenge", // Oh no!
      }),
    });
    body = await res.json();
    expect(res.status).toBe(401); // Unauthorized
    expect(body.message).toMatch("Authentication failed");
    expect(res.headers.get("set-cookie")).toBeNull(); // no session cookie yet

    res = await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: BASE_64_ID,
        rawId: BASE_64_ID,
        response,
        clientExtensionResults: {},
        type: "public-key",
        challenge,
      }),
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("This user account is not yet activated");
    expect(res.headers.get("set-cookie")).toBeNull(); // no session cookie yet

    // Activate user account
    await app.request(`${basePath}${usersAPIPath}/${encodeURIComponent("jim.doe@example.com")}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ accessRights: 1 }),
    });

    res = await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: BASE_64_ID,
        rawId: BASE_64_ID,
        response,
        clientExtensionResults: {},
        type: "public-key",
        challenge,
      }),
    });
    expect(res.status).toBe(204);

    // Check that session cookie works
    const idCookieHeader = res.headers.get("set-cookie")!.split(";")[0];
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: idCookieHeader } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("jim.doe@example.com");
    expect(body.name).toBe("Jim Doe");
    expect(body.accessRights).toBe(1);
  },
});

tests.push({
  testName: "[unsafe] registers and authenticates the first user",
  testFunction: async () => {
    // Delete all existing users
    await Promise.all([
      app.request(`${basePath}${accountAPIPath}`, {
        method: "DELETE",
        headers: { Cookie: "id=exampleSessionID" },
      }),
      app.request(`${basePath}${accountAPIPath}`, {
        method: "DELETE",
        headers: { Cookie: "id=anotherExampleSessionID" },
      }),
    ]);

    // Get Registration Challenge
    let res = await app.request(
      `${basePath}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("jim.doe@example.com")}&name=${encodeURIComponent("Jim Doe")}`,
    );
    let body = await res.json();

    // Post Registration Response
    await app.request(
      `${basePath}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("jim.doe@example.com")}&name=${encodeURIComponent("Jim Doe")}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: BASE_64_ID,
          rawId: BASE_64_ID,
          response: {
            clientDataJSON: Buffer.from(
              JSON.stringify({
                type: "webauthn.create",
                challenge: body.challenge,
                origin: `https://${process.env.FQDN}`,
              }),
            ).toString("base64url"),
            attestationObject: Buffer.from("Attestation Object").toString("base64url"),
          },
          clientExtensionResults: {},
          type: "public-key",
        }),
      },
    );

    // Get Authentication Challenge
    res = await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`);
    body = await res.json();

    // Post Authentication Response
    res = await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: BASE_64_ID,
        rawId: BASE_64_ID,
        response: {
          clientDataJSON: Buffer.from(
            JSON.stringify({
              type: "webauthn.get",
              challenge: body.challenge,
              origin: `https://${process.env.FQDN}`,
            }),
          ).toString("base64url"),
          authenticatorData: Buffer.from("Authenticator Data").toString("base64url"),
          signature: Buffer.from("Signature").toString("base64url"),
          userHandle: "jim.doe@example.com",
        },
        clientExtensionResults: {},
        type: "public-key",
        challenge: body.challenge,
      }),
    });
    const idCookieHeader = res.headers.get("set-cookie")!.split(";")[0];

    // Since we are the only user existing in the database, we should be logged in immediately and have ultimate
    // access rights.
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: idCookieHeader } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("jim.doe@example.com");
    expect(body.name).toBe("Jim Doe");
    expect(body.accessRights).toBe(255);
  },
});

tests.push({
  testName: "[unsafe] registers and authenticates a new user using OpenID Connect",
  testFunction: async () => {
    // Get authorization URL
    let res = await app.request(`${basePath}${authAPIPath}${oidcEndpointSuffix}`);
    expect(res.status).toBe(302);
    const authorizationURL = new URL(res.headers.get("location")!);
    expect(authorizationURL.protocol).toBe("https:");
    expect(authorizationURL.hostname).toBe("sso.example.com");
    expect(authorizationURL.pathname).toBe("/protocol/openid-connect/auth");
    expect(authorizationURL.searchParams.get("client_id")).toBe("rating-tracker");
    expect(authorizationURL.searchParams.get("redirect_uri")).toBe("https://subdomain.example.com/login");
    expect(authorizationURL.searchParams.get("response_type")).toBe("code");
    expect(authorizationURL.searchParams.get("scope")).toBe("openid profile email phone");
    expect(authorizationURL.searchParams.has("code_challenge")).toBeTruthy();
    expect(authorizationURL.searchParams.get("code_challenge_method")).toBe("S256");

    const codeVerifierCookie = res.headers.get("set-cookie")!.split(";")[0];

    // The code challenge cookie must be present
    res = await app.request(`${basePath}${authAPIPath}${oidcEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: "jim.doe", iss: "https://sso.example.com" }),
    });
    let body = await res.json();
    expect(res.status).toBe(400);
    expect(body.message).toMatch("No code verifier was provided");

    res = await app.request(`${basePath}${authAPIPath}${oidcEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: codeVerifierCookie },
      body: JSON.stringify({ code: "jim.doe", iss: "https://sso.example.com" }),
    });
    expect(res.status).toBe(204);

    // Temporary cookies should be deleted
    expect(res.headers.get("set-cookie")).toMatch("codeVerifier=;");
    expect(res.headers.get("set-cookie")).toMatch("nonce=;");

    // Check that session cookie works
    const idCookieHeader = res.headers
      .get("set-cookie")!
      .substring(res.headers.get("set-cookie")!.indexOf("id="))
      .split(";")[0];
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: idCookieHeader } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("jim.doe@example.com");
    expect(body.name).toBe("Jim Doe");
    expect(body.accessRights).toBe(1);
    expect(body.oidcIdentity.sub).toBe("22222222-2222-2222-2222-222222222222");
    expect(body.oidcIdentity.preferredUsername).toBe("jim.doe");
  },
});

tests.push({
  testName: "does not create a user whose email address is not verified",
  testFunction: async () => {
    // The OpenID Connect provider must declare that they verified the user’s email address
    let res = await app.request(`${basePath}${authAPIPath}${oidcEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: "codeVerifier=jess.doe" },
      body: JSON.stringify({ code: "jess.doe", iss: "https://sso.example.com" }),
    });
    let body = await res.json();
    expect(res.status).toBe(401);
    expect(body.message).toMatch("The OpenID Connect provider did not verify the user’s email address");
  },
});

tests.push({
  testName: "[unsafe] does not create a session for a new user with no access rights",
  testFunction: async () => {
    // No access rights array
    let res = await app.request(`${basePath}${authAPIPath}${oidcEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: "codeVerifier=jack.doe" },
      body: JSON.stringify({ code: "jack.doe", iss: "https://sso.example.com" }),
    });
    let body = await res.json();
    expect(res.status).toBe(401);
    expect(body.message).toMatch("Unable to retrieve user roles from the OpenID Connect provider");

    // Check that no session cookie was issued
    expect(res.headers.get("set-cookie")).not.toMatch("id=");

    // Empty access rights array
    res = await app.request(`${basePath}${authAPIPath}${oidcEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: "codeVerifier=jen.doe" },
      body: JSON.stringify({ code: "jen.doe", iss: "https://sso.example.com" }),
    });
    body = await res.json();
    expect(res.status).toBe(403);
    expect(body.message).toMatch("This user account is not yet activated");

    // Check that no session cookie was issued
    expect(res.headers.get("set-cookie")).not.toMatch("id=");
  },
});

tests.push({
  testName: "[unsafe] adds an OpenID Connect identity to an existing authenticated user",
  testFunction: async () => {
    // We cannot add another OpenID Connect identity to a user that already has one
    let res = await app.request(`${basePath}${authAPIPath}${oidcEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: "codeVerifier=jane.doe; id=exampleSessionID" },
      body: JSON.stringify({ code: "jane.doe", iss: "https://sso.example.com" }),
    });
    let body = await res.json();
    expect(res.status).toBe(409);
    expect(body.message).toMatch("User jane.doe@example.com already has an OpenID Connect identity");

    res = await app.request(`${basePath}${authAPIPath}${oidcEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: "codeVerifier=john.doe; id=anotherExampleSessionID" },
      body: JSON.stringify({ code: "john.doe", iss: "https://sso.example.com" }),
    });
    expect(res.status).toBe(204);
    // Since we are already authenticated, only our existing session cookie will be renewed.
    // No new session ID will be created.
    expect(res.headers.get("set-cookie")).toMatch("id=anotherExampleSessionID");

    // Check that the user has an OpenID Connect identity
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: "id=anotherExampleSessionID" } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("john.doe@example.com");
    expect(body.name).toBe("John Doe");
    // Phone number provided by OpenID Connect does not match our required format and must not be updated
    expect(body.phone).not.toBe("01234567890");
    expect(body.accessRights).toBe(3); // Access rights were updated
    expect(body.oidcIdentity.sub).toBe("11111111-1111-1111-1111-111111111111");
    expect(body.oidcIdentity.preferredUsername).toBe("john.doe");
  },
});

tests.push({
  testName: "[unsafe] adds an OpenID Connect identity to an existing user based on their email",
  testFunction: async () => {
    let res = await app.request(`${basePath}${authAPIPath}${oidcEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: "codeVerifier=john.doe" },
      body: JSON.stringify({ code: "john.doe", iss: "https://sso.example.com" }),
    });
    expect(res.status).toBe(204);

    // Check that session cookie works
    const idCookieHeader = res.headers
      .get("set-cookie")!
      .substring(res.headers.get("set-cookie")!.indexOf("id="))
      .split(";")[0];
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: idCookieHeader } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("john.doe@example.com");
    expect(body.name).toBe("John Doe");
    expect(body.accessRights).toBe(3); // Access rights were updated
    expect(body.oidcIdentity.sub).toBe("11111111-1111-1111-1111-111111111111");
    expect(body.oidcIdentity.preferredUsername).toBe("john.doe");
  },
});

tests.push({
  testName: "[unsafe] updates the information of a user with an existing OpenID Connect identity",
  testFunction: async () => {
    // Check the current information
    let res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("jane.doe@example.com");
    expect(body.name).toBe("Jane Doe");
    expect(body.accessRights).toBe(255);
    expect(body.oidcIdentity.sub).toBe("00000000-0000-0000-0000-000000000000");
    expect(body.oidcIdentity.preferredUsername).toBe("jane.doe");

    // Authenticate with OpenID Connect
    res = await app.request(`${basePath}${authAPIPath}${oidcEndpointSuffix}`, {
      method: "POST",
      headers: { "content-type": "application/json", Cookie: "codeVerifier=jane.doe" },
      body: JSON.stringify({ code: "jane.doe", iss: "https://sso.example.com" }),
    });
    expect(res.status).toBe(204);

    // Check that session cookie works
    const idCookieHeader = res.headers
      .get("set-cookie")!
      .substring(res.headers.get("set-cookie")!.indexOf("id="))
      .split(";")[0];
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: idCookieHeader } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("jane.roe@example.com"); // Email address was updated
    expect(body.name).toBe("Jane Roe"); // Name was updated
    expect(body.phone).toBe("+1234567890"); // Phone number was updated
    expect(body.accessRights).toBe(131); // Access rights were updated
    expect(body.oidcIdentity.sub).toBe("00000000-0000-0000-0000-000000000000");
    expect(body.oidcIdentity.preferredUsername).toBe("jane.roe"); // Preferred username was updated
  },
});

tests.push({
  testName: "refuses to provide a registration challenge request from an existing user",
  testFunction: async () => {
    const res = await app.request(
      `${basePath}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("jane.doe@example.com")}&name=${encodeURIComponent("Jane Doe")}`,
    );
    const body = await res.json();
    expect(res.status).toBe(409);
    expect(body.message).toMatch(ALREADY_REGISTERED_ERROR_MESSAGE);
  },
});

tests.push({
  testName: "refuses to provide a registration challenge request from an invalid user",
  testFunction: async () => {
    const res = await app.request(
      `${basePath}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("notAnEmailAddress")}&name=${encodeURIComponent("John Doe")}`,
    );
    expect(res.status).toBe(400);
  },
});

tests.push({
  testName: "refuses to provide a registration challenge without user information",
  testFunction: async () => {
    let res = await app.request(`${basePath}${authAPIPath}${registerEndpointSuffix}`);
    expect(res.status).toBe(400);
    res = await app.request(`${basePath}${authAPIPath}${registerEndpointSuffix}?email=&name=`);
    expect(res.status).toBe(400);
  },
});

tests.push({
  testName: "[unsafe!] rate limiter accepts X-Forwarded-For header from exactly one reverse proxy",
  testFunction: async () => {
    await Promise.all(
      // Request 60 authentication challenges from different IP addresses
      [...Array(60)].map(
        async (_, i) =>
          await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`, {
            headers: { "X-Forwarded-For": `10.0.${i}.2` },
          }),
      ),
    );

    // Since the requests were sent from different IP addresses, the rate limiter should not be active yet.
    const res = await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`, {
      headers: { "X-Forwarded-For": "10.0.60.2" },
    });
    expect(res.status).toBe(200);
  },
});

tests.push({
  testName: "[unsafe!] rate limiter cannot be tricked with X-Forwarded-For header set by a client",
  testFunction: async () => {
    await Promise.all(
      // Request 60 authentication challenges from the same client manipulating the X-Forwarded-For header
      [...Array(60)].map(
        async (_, i) =>
          await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`, {
            headers: { "X-Forwarded-For": `10.0.${i}.2, 10.0.0.254` },
          }),
      ),
    );

    // Those were too many. The rate limiter should now refuse to provide more.
    const res = await app.request(`${basePath}${authAPIPath}${signInEndpointSuffix}`, {
      headers: { "X-Forwarded-For": "10.0.60.2, 10.0.0.254" },
    });
    expect(res.status).toBe(429);
  },
});
