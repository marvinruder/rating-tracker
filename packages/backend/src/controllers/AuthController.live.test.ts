import {
  registerEndpointPath,
  signInEndpointPath,
  userEndpointPath,
  userManagementEndpointPath,
} from "@rating-tracker/commons";
import { LiveTestSuite, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Authentication API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "[unsafe] registers and authenticates a new user",
  testFunction: async () => {
    // Get Registration Challenge
    let res = await supertest.get(`/api${registerEndpointPath}?email=jim.doe%40example.com&name=Jim%20Doe`);
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
        })
      ).toString("base64"),
    } as unknown;

    // Post Registration Response
    res = await supertest
      .post(`/api${registerEndpointPath}?email=jim.doe%40example.com&name=Jim%20Doe`)
      .send({ response });
    expect(res.status).toBe(500); // Internal Server Error
    expect(res.body.message).toMatch("Missing credential ID");

    res = await supertest.post(`/api${registerEndpointPath}?email=jim.doe%40example.com&name=Jim%20Doe`).send({
      id: "ID",
      response: {
        clientDataJSON: Buffer.from(
          JSON.stringify({
            type: "webauthn.create",
            challenge: "Wrong challenge", // Oh no!
            origin: `https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}`,
          })
        ).toString("base64"),
      },
    });
    expect(res.status).toBe(400); // Bad Request
    expect(res.body.message).toMatch("Registration failed");

    res = await supertest.post(`/api${registerEndpointPath}?email=jim.doe%40example.com&name=Jim%20Doe`).send({
      id: "ID",
      response,
    });
    expect(res.status).toBe(201); // Successful registration

    res = await supertest.post(`/api${registerEndpointPath}?email=jim.doe%40example.com&name=Jim%20Doe`).send({
      id: "ID",
      response,
    });
    expect(res.status).toBe(403); // Hey, we have done that already!

    // Get Authentication Challenge
    res = await supertest.get(`/api${signInEndpointPath}`);
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
        })
      ).toString("base64"),
      userHandle: "jim.doe@example.com",
    };

    // Post Registration Response
    res = await supertest.post(`/api${signInEndpointPath}`).send({
      challenge,
      response,
    });
    expect(res.status).toBe(500); // Internal Server Error
    expect(res.body.message).toMatch("Missing credential ID");
    expect(res.headers["set-cookie"]).toBeUndefined(); // no session cookie yet

    res = await supertest.post(`/api${signInEndpointPath}`).send({
      id: "ID",
      challenge: "Wrong challenge", // Oh no!
      response,
    });
    expect(res.status).toBe(400); // Bad Request
    expect(res.body.message).toMatch("Authentication failed");
    expect(res.headers["set-cookie"]).toBeUndefined(); // no session cookie yet

    res = await supertest.post(`/api${signInEndpointPath}`).send({
      id: "ID",
      challenge,
      response,
    });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("This user account is not yet activated");
    expect(res.headers["set-cookie"]).toBeUndefined(); // no session cookie yet

    // Activate user account
    await supertest
      .patch(`/api${userManagementEndpointPath}/jim.doe%40example.com?accessRights=1`)
      .set("Cookie", ["authToken=exampleSessionID"]);

    res = await supertest.post(`/api${signInEndpointPath}`).send({
      id: "ID",
      challenge,
      response,
    });
    expect(res.status).toBe(204);

    // Check that session cookie works
    const authTokenCookieHeader = res.headers["set-cookie"][0].split(";")[0];
    res = await supertest.get(`/api${userEndpointPath}`).set("Cookie", [authTokenCookieHeader]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jim.doe@example.com");
    expect(res.body.name).toBe("Jim Doe");
    expect(res.body.accessRights).toBe(1);
  },
});

tests.push({
  testName: "rejects a registration challenge request from an existing user",
  testFunction: async () => {
    const res = await supertest.get(`/api${registerEndpointPath}?email=jane.doe%40example.com&name=Jane%20Doe`);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch("This email address is already registered. Please sign in.");
  },
});

tests.push({
  testName: "rejects a registration challenge request from an unknown user",
  testFunction: async () => {
    const res = await supertest.get(`/api${registerEndpointPath}?email=notAnEmailAddress&name=John%20Doe`);
    expect(res.status).toBe(400);
  },
});

tests.push({
  testName: "rejects a registration challenge request from an invalid user",
  testFunction: async () => {
    const res = await supertest.get(`/api${registerEndpointPath}`);
    expect(res.status).toBe(400);
  },
});

tests.push({
  testName: "[unsafe!] does not provide too many authentication challenges",
  testFunction: async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of [...Array(60)]) {
      // Request 60 authentication challenges
      await supertest.get(`/api${signInEndpointPath}`);
    }
    // Those were too many. The rate limiter should now refuse to provide more.
    const res = await supertest.get(`/api${signInEndpointPath}`);
    expect(res.status).toBe(429);
  },
});
