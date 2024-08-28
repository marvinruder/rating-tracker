import { baseURL, statusAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Status API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "returns status “unhealthy”",
  testFunction: async () => {
    const res = await app.request(`${baseURL}${statusAPIPath}`);
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.status).toBe("unhealthy");

    // Available during live tests:
    expect(body.services).not.toHaveProperty("PostgreSQL");

    // Mocked to be not ready during live tests:
    expect(body.services).toHaveProperty("Signal");
    expect(body.services.Signal).toMatch("Signal is not ready");
  },
});
