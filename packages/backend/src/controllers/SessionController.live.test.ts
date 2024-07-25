import { baseURL, sessionAPIPath, accountAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { supertest } from "../../test/liveTestHelpers";

export const suiteName = "Session API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "renews cookie when token is valid",
  testFunction: async () => {
    const res = await supertest.head(`${baseURL}${sessionAPIPath}`).set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(204);
    expect(res.header["set-cookie"][0]).toMatch("id=exampleSessionID;");
    expect(res.header["set-cookie"][0]).toMatch("HttpOnly; Secure; SameSite=Strict");
  },
});

tests.push({
  testName: "does not renew cookie when token is about to expire",
  testFunction: async () => {
    const res = await supertest.head(`${baseURL}${sessionAPIPath}`).set("Cookie", ["id=eolSessionID"]);
    expect(res.status).toBe(204);
    expect(res.header["set-cookie"]).toBeUndefined();
  },
});

tests.push({
  testName: "clears cookie when token is expired",
  testFunction: async () => {
    const res = await supertest.head(`${baseURL}${sessionAPIPath}`).set("Cookie", ["id=expiredSessionID"]);
    expect(res.header["set-cookie"][0]).toMatch("id=;");
    expect(res.status).toBe(401);
  },
});

tests.push({
  testName: "clears cookie when token is invalid",
  testFunction: async () => {
    const res = await supertest.head(`${baseURL}${sessionAPIPath}`).set("Cookie", ["id=invalidSessionID"]);
    expect(res.status).toBe(401);
    expect(res.header["set-cookie"][0]).toMatch("id=;");
  },
});

tests.push({
  testName: "[unsafe] deletes session when signing out",
  testFunction: async () => {
    let res = await supertest.delete(`${baseURL}${sessionAPIPath}`).set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(204);
    expect(res.header["set-cookie"][1]).toMatch("id=;");

    // Check whether we can still access the current user
    res = await supertest.get(`${baseURL}${accountAPIPath}`).set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toHaveLength(0);
  },
});
