import {
  ALREADY_REGISTERED_ERROR_MESSAGE,
  baseURL,
  registerEndpointSuffix,
  signInEndpointSuffix,
  accountAPIPath,
  usersAPIPath,
  authAPIPath,
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
      `${baseURL}${authAPIPath}${registerEndpointSuffix}` +
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
        JSON.stringify({
          type: "webauthn.create",
          challenge,
          origin: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
        }),
      ).toString("base64url"),
      attestationObject: Buffer.from("Attestation Object").toString("base64url"),
    } as object;

    // Post Registration Response
    res = await app.request(
      `${baseURL}${authAPIPath}${registerEndpointSuffix}` +
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
      `${baseURL}${authAPIPath}${registerEndpointSuffix}` +
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
                origin: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
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
      `${baseURL}${authAPIPath}${registerEndpointSuffix}` +
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
      `${baseURL}${authAPIPath}${registerEndpointSuffix}` +
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
    res = await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`);
    body = await res.json();
    expect(res.status).toBe(200);
    expect(typeof body.challenge).toBe("string");
    expect(typeof body.timeout).toBe("number");
    expect(body.rpId).toBe(`${process.env.DOMAIN}`);
    expect(body.userVerification).toBe("required");

    challenge = body.challenge;
    response = {
      clientDataJSON: Buffer.from(
        JSON.stringify({
          type: "webauthn.get",
          challenge,
          origin: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
        }),
      ).toString("base64url"),
      authenticatorData: Buffer.from("Authenticator Data").toString("base64url"),
      signature: Buffer.from("Signature").toString("base64url"),
      userHandle: "jim.doe@example.com",
    };

    // Post Authentication Response
    res = await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`, {
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

    res = await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`, {
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

    res = await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`, {
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
              origin: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
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

    res = await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`, {
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
    await app.request(`${baseURL}${usersAPIPath}/${encodeURIComponent("jim.doe@example.com")}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ accessRights: 1 }),
    });

    res = await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`, {
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
    res = await app.request(`${baseURL}${accountAPIPath}`, { headers: { Cookie: idCookieHeader } });
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
      app.request(`${baseURL}${accountAPIPath}`, {
        method: "DELETE",
        headers: { Cookie: "id=exampleSessionID" },
      }),
      app.request(`${baseURL}${accountAPIPath}`, {
        method: "DELETE",
        headers: { Cookie: "id=anotherExampleSessionID" },
      }),
    ]);

    // Get Registration Challenge
    let res = await app.request(
      `${baseURL}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("jim.doe@example.com")}&name=${encodeURIComponent("Jim Doe")}`,
    );
    let body = await res.json();

    // Post Registration Response
    await app.request(
      `${baseURL}${authAPIPath}${registerEndpointSuffix}` +
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
                origin: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
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
    res = await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`);
    body = await res.json();

    // Post Authentication Response
    res = await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`, {
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
              origin: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
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
    res = await app.request(`${baseURL}${accountAPIPath}`, { headers: { Cookie: idCookieHeader } });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("jim.doe@example.com");
    expect(body.name).toBe("Jim Doe");
    expect(body.accessRights).toBe(255);
  },
});

tests.push({
  testName: "refuses to provide a registration challenge request from an existing user",
  testFunction: async () => {
    const res = await app.request(
      `${baseURL}${authAPIPath}${registerEndpointSuffix}` +
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
      `${baseURL}${authAPIPath}${registerEndpointSuffix}` +
        `?email=${encodeURIComponent("notAnEmailAddress")}&name=${encodeURIComponent("John Doe")}`,
    );
    expect(res.status).toBe(400);
  },
});

tests.push({
  testName: "refuses to provide a registration challenge without user information",
  testFunction: async () => {
    let res = await app.request(`${baseURL}${authAPIPath}${registerEndpointSuffix}`);
    expect(res.status).toBe(400);
    res = await app.request(`${baseURL}${authAPIPath}${registerEndpointSuffix}?email=&name=`);
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
          await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`, {
            headers: { "X-Forwarded-For": `10.0.${i}.2` },
          }),
      ),
    );

    // Since the requests were sent from different IP addresses, the rate limiter should not be active yet.
    const res = await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`, {
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
          await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`, {
            headers: { "X-Forwarded-For": `10.0.${i}.2, 10.0.0.254` },
          }),
      ),
    );

    // Those were too many. The rate limiter should now refuse to provide more.
    const res = await app.request(`${baseURL}${authAPIPath}${signInEndpointSuffix}`, {
      headers: { "X-Forwarded-For": "10.0.60.2, 10.0.0.254" },
    });
    expect(res.status).toBe(429);
  },
});
