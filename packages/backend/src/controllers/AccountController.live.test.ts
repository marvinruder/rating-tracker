import {
  baseURL,
  sessionEndpointPath,
  accountEndpointPath,
  accountAvatarEndpointSuffix,
} from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Account API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "returns empty object when no user is logged in",
  testFunction: async () => {
    const res = await supertest.get(`${baseURL}${accountEndpointPath}`);
    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toHaveLength(0);
  },
});

tests.push({
  testName: "provides current user’s information",
  testFunction: async () => {
    const res = await supertest.get(`${baseURL}${accountEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).length).toBeGreaterThan(0);
    expect(res.body.email).toBe("jane.doe@example.com");
    expect(res.body.name).toBe("Jane Doe");
    expect(res.body.phone).toBe("+123456789");
    // Authentication-related fields should not be exposed
    expect(res.body.credentialID).toBeUndefined();
    expect(res.body.credentialPublicKey).toBeUndefined();
    expect(res.body.counter).toBeUndefined();
  },
});

tests.push({
  testName: "provides current user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`);
    const res = await supertest
      .get(`${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/jpeg");
    expect((res.body as Buffer).toString("ascii")).toMatch("Some fancy avatar image");
  },
});

tests.push({
  testName: "validates the phone number",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${accountEndpointPath}`, supertest.patch);
    let res = await supertest
      .patch(`${baseURL}${accountEndpointPath}?phone=987654321`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
    res = await supertest
      .patch(`${baseURL}${accountEndpointPath}?phone=+1%20234%20567%2D8900`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);

    // Check that no changes were applied
    res = await supertest.get(`${baseURL}${accountEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.phone).toBe("+123456789");
  },
});

tests.push({
  testName: "[unsafe] updates current user’s email address",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${accountEndpointPath}`, supertest.patch);
    let res = await supertest
      .patch(`${baseURL}${accountEndpointPath}?email=jane.doe.2%40example%2Ecom`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await supertest.get(`${baseURL}${accountEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jane.doe.2@example.com");
  },
});

tests.push({
  testName: "[unsafe] updates current user’s information without email address",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${accountEndpointPath}`, supertest.patch);
    let res = await supertest
      .patch(`${baseURL}${accountEndpointPath}?name=Jane%20Doe%20II%2E&phone=%2B987654321`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await supertest.get(`${baseURL}${accountEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jane.doe@example.com");
    expect(res.body.name).toBe("Jane Doe II.");
    expect(res.body.phone).toBe("+987654321");
  },
});

tests.push({
  testName: "[unsafe] updates current user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(
      `${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`,
      supertest.put,
      "image/avif",
    );

    // Only certain media types are allowed
    let res = await supertest
      .put(`${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`)
      .set("Content-Type", "image/png")
      .send("Another fancy avatar image")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(415);

    res = await supertest
      .put(`${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`)
      .set("Content-Type", "image/avif")
      .send("Another fancy avatar image")
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(201);

    // Check that the changes were applied
    res = await supertest
      .get(`${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/avif");
    expect((res.body as Buffer).toString("ascii")).toMatch("Another fancy avatar image");
  },
});

tests.push({
  testName: "disallows changing own access rights",
  testFunction: async () => {
    const res = await supertest
      .patch(`${baseURL}${accountEndpointPath}?accessRights=255`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
  },
});

tests.push({
  testName: "[unsafe] deletes the current user",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${accountEndpointPath}`, supertest.delete);
    let res = await supertest
      .delete(`${baseURL}${accountEndpointPath}`)
      .set("Cookie", ["authToken=anotherExampleSessionID"]);

    // Check that the user was deleted
    res = await supertest.head(`${baseURL}${sessionEndpointPath}`).set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(401);
  },
});

tests.push({
  testName: "[unsafe] deletes the current user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`, supertest.delete);
    let res = await supertest
      .delete(`${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the avatar was deleted
    res = await supertest
      .get(`${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});
