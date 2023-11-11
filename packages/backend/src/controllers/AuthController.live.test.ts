import {
  ALREADY_REGISTERED_ERROR_MESSAGE,
  baseURL,
  registerEndpointPath,
  signInEndpointPath,
  accountEndpointPath,
  usersEndpointPath,
} from "@rating-tracker/commons";

import { LiveTestSuite, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Authentication API";

export const tests: LiveTestSuite = [];

const BASE_64_ID = Buffer.from("ID").toString("base64url");

tests.push({
  testName: "[unsafe] registers and authenticates a new user",
  testFunction: async () => {
    // Get Registration Challenge
    let res = await supertest.get(`${baseURL}${registerEndpointPath}?email=jim.doe%40example.com&name=Jim%20Doe`);
    expect(res.status).toBe(200);
    expect(typeof res.body.challenge).toBe("string");
    expect(typeof res.body.timeout).toBe("number");
    expect(res.body.rp.id).toBe(`${process.env.DOMAIN}`);
    expect(res.body.rp.name).toMatch("Rating Tracker");
    expect(res.body.user.id).toBe("jim.doe@example.com");
    expect(res.body.user.name).toBe("Jim Doe");
    expect(res.body.attestation).toBe("none");
    expect(res.body.excludeCredentials).toHaveLength(0);
    expect(res.body.authenticatorSelection.userVerification).toBe("required");
    expect(res.body.authenticatorSelection.residentKey).toBe("required");
    expect(res.body.authenticatorSelection.requireResidentKey).toBeTruthy();

    let challenge = res.body.challenge;
    let response = {
      clientDataJSON: Buffer.from(
        JSON.stringify({
          type: "webauthn.create",
          challenge,
          origin: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
        }),
      ).toString("base64"),
    } as object;

    // Post Registration Response
    res = await supertest.post(`${baseURL}${registerEndpointPath}?email=jim.doe%40example.com&name=Jim%20Doe`).send({
      id: BASE_64_ID,
      rawId: "ID",
      response,
    });
    expect(res.status).toBe(500); // Internal Server Error
    expect(res.body.message).toMatch("Credential ID was not base64url-encoded");

    res = await supertest.post(`${baseURL}${registerEndpointPath}?email=jim.doe%40example.com&name=Jim%20Doe`).send({
      id: BASE_64_ID,
      rawId: BASE_64_ID,
      response: {
        clientDataJSON: Buffer.from(
          JSON.stringify({
            type: "webauthn.create",
            challenge: "Wrong challenge", // Oh no!
            origin: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
          }),
        ).toString("base64"),
      },
    });
    expect(res.status).toBe(400); // Bad Request
    expect(res.body.message).toMatch("Registration failed");

    res = await supertest.post(`${baseURL}${registerEndpointPath}?email=jim.doe%40example.com&name=Jim%20Doe`).send({
      id: BASE_64_ID,
      rawId: BASE_64_ID,
      response,
    });
    expect(res.status).toBe(201); // Successful registration

    res = await supertest.post(`${baseURL}${registerEndpointPath}?email=jim.doe%40example.com&name=Jim%20Doe`).send({
      id: BASE_64_ID,
      rawId: BASE_64_ID,
      response,
    });
    expect(res.status).toBe(403); // Hey, we have done that already!

    // Get Authentication Challenge
    res = await supertest.get(`${baseURL}${signInEndpointPath}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.challenge).toBe("string");
    expect(typeof res.body.timeout).toBe("number");
    expect(res.body.rpId).toBe(`${process.env.DOMAIN}`);
    expect(res.body.userVerification).toBe("required");

    challenge = res.body.challenge;
    response = {
      clientDataJSON: Buffer.from(
        JSON.stringify({
          type: "webauthn.get",
          challenge,
          origin: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
        }),
      ).toString("base64"),
      userHandle: "jim.doe@example.com",
    };

    // Post Authentication Response
    res = await supertest.post(`${baseURL}${signInEndpointPath}`).send({
      id: BASE_64_ID,
      rawId: "ID",
      challenge,
      response,
    });
    expect(res.status).toBe(500); // Internal Server Error
    expect(res.body.message).toMatch("Credential ID was not base64url-encoded");
    expect(res.headers["set-cookie"]).toBeUndefined(); // no session cookie yet

    res = await supertest.post(`${baseURL}${signInEndpointPath}`).send({
      id: "ID", // not base64-encoded -- no existing user with that ID
      rawId: "ID",
      challenge,
      response,
    });
    expect(res.status).toBe(404); // Not found
    expect(res.body.message).toMatch("User with credential ID not found");
    expect(res.headers["set-cookie"]).toBeUndefined(); // no session cookie yet

    res = await supertest.post(`${baseURL}${signInEndpointPath}`).send({
      id: BASE_64_ID,
      rawId: BASE_64_ID,
      challenge: "Wrong challenge", // Oh no!
      response,
    });
    expect(res.status).toBe(400); // Bad Request
    expect(res.body.message).toMatch("Authentication failed");
    expect(res.headers["set-cookie"]).toBeUndefined(); // no session cookie yet

    res = await supertest.post(`${baseURL}${signInEndpointPath}`).send({
      id: BASE_64_ID,
      rawId: BASE_64_ID,
      challenge,
      response,
    });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("This user account is not yet activated");
    expect(res.headers["set-cookie"]).toBeUndefined(); // no session cookie yet

    // Activate user account
    await supertest
      .patch(`${baseURL}${usersEndpointPath}/jim.doe%40example.com?accessRights=1`)
      .set("Cookie", ["authToken=exampleSessionID"]);

    res = await supertest.post(`${baseURL}${signInEndpointPath}`).send({
      id: BASE_64_ID,
      rawId: BASE_64_ID,
      challenge,
      response,
    });
    expect(res.status).toBe(204);

    // Check that session cookie works
    const authTokenCookieHeader = res.headers["set-cookie"][0].split(";")[0];
    res = await supertest.get(`${baseURL}${accountEndpointPath}`).set("Cookie", [authTokenCookieHeader]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jim.doe@example.com");
    expect(res.body.name).toBe("Jim Doe");
    expect(res.body.accessRights).toBe(1);
  },
});

tests.push({
  testName: "rejects a registration challenge request from an existing user",
  testFunction: async () => {
    const res = await supertest.get(`${baseURL}${registerEndpointPath}?email=jane.doe%40example.com&name=Jane%20Doe`);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(ALREADY_REGISTERED_ERROR_MESSAGE);
  },
});

tests.push({
  testName: "rejects a registration challenge request from an unknown user",
  testFunction: async () => {
    const res = await supertest.get(`${baseURL}${registerEndpointPath}?email=notAnEmailAddress&name=John%20Doe`);
    expect(res.status).toBe(400);
  },
});

tests.push({
  testName: "rejects a registration challenge request from an invalid user",
  testFunction: async () => {
    const res = await supertest.get(`${baseURL}${registerEndpointPath}`);
    expect(res.status).toBe(400);
  },
});

tests.push({
  testName: "[unsafe!] rate limiter accepts X-Forwarded-For header from exactly one reverse proxy",
  testFunction: async () => {
    await Promise.all(
      // Request 60 authentication challenges from different IP addresses
      [...Array(60)].map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async (_, i) => await supertest.get(`${baseURL}${signInEndpointPath}`).set("X-Forwarded-For", `10.0.${i}.2`),
      ),
    );

    // Since the requests were sent from different IP addresses, the rate limiter should not be active yet.
    const res = await supertest.get(`${baseURL}${signInEndpointPath}`).set("X-Forwarded-For", "10.0.60.2");
    expect(res.status).toBe(200);
  },
});

tests.push({
  testName: "[unsafe!] rate limiter cannot be tricked with X-Forwarded-For header set by a client",
  testFunction: async () => {
    await Promise.all(
      // Request 60 authentication challenges from the same client manipulating the X-Forwarded-For header
      [...Array(60)].map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async (_, i) =>
          await supertest.get(`${baseURL}${signInEndpointPath}`).set("X-Forwarded-For", `10.0.${i}.2, 10.0.0.254`),
      ),
    );

    // Those were too many. The rate limiter should now refuse to provide more.
    const res = await supertest.get(`${baseURL}${signInEndpointPath}`).set("X-Forwarded-For", "10.0.60.2, 10.0.0.254");
    expect(res.status).toBe(429);
  },
});
