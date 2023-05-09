import { sessionEndpointPath, userEndpointPath } from "@rating-tracker/commons";
import { LiveTestSuite, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Session API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "renews cookie when token is valid",
  testFunction: async () => {
    const res = await supertest.head(`/api${sessionEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    expect(res.header["set-cookie"][0]).toMatch("authToken=exampleSessionID;");
    expect(res.header["set-cookie"][0]).toMatch("HttpOnly; Secure; SameSite=Strict");
  },
});

tests.push({
  testName: "clears cookie when token is invalid",
  testFunction: async () => {
    const res = await supertest.head(`/api${sessionEndpointPath}`).set("Cookie", ["authToken=invalidSessionID"]);
    expect(res.status).toBe(401);
    expect(res.header["set-cookie"][0]).toMatch("authToken=;");
  },
});

tests.push({
  testName: "[unsafe] deletes session when signing out",
  testFunction: async () => {
    let res = await supertest.delete(`/api${sessionEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);
    expect(res.header["set-cookie"][1]).toMatch("authToken=;");

    // Check whether we can still access the current user
    res = await supertest.get(`/api${userEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(401);
  },
});
