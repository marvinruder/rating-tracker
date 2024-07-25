import { baseURL, statusAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { supertest } from "../../test/liveTestHelpers";

export const suiteName = "Status API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "returns status “unhealthy”",
  testFunction: async () => {
    const res = await supertest.get(`${baseURL}${statusAPIPath}`);
    expect(res.status).toBe(500);
    expect(res.body.status).toBe("unhealthy");

    // Available during live tests:
    expect(res.body.services).not.toHaveProperty("PostgreSQL");

    // Mocked to be not ready during live tests:
    expect(res.body.services).toHaveProperty("Signal");
    expect(res.body.services.Signal).toBe("Signal is not ready");
  },
});
