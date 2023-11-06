import { baseURL, statusEndpointPath } from "@rating-tracker/commons";

import { LiveTestSuite, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Status API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "returns status “unhealthy”",
  testFunction: async () => {
    const res = await supertest.get(`${baseURL}${statusEndpointPath}`);
    expect(res.status).toBe(500);
    expect(res.body.status).toBe("unhealthy");

    // Available during live tests:
    expect(res.body.services).not.toHaveProperty("PostgreSQL");
    expect(res.body.services).not.toHaveProperty("Redis");

    // Not available during live tests:
    // expect(res.body.services).toHaveProperty("Selenium");
    expect(res.body.services).toHaveProperty("Signal");
  },
});
