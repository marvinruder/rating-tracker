import { basePath, statusAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Status API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "returns status “unhealthy”",
  testFunction: async () => {
    const res = await app.request(`${basePath}${statusAPIPath}`);
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.status).toBe("unhealthy");

    // Available during live tests:
    expect(body.services.PostgreSQL).toMatch("Connected");

    // Configured during live tests:
    expect(body.services.Email).toMatch("Configured");

    // Mocked to be not ready during live tests:
    expect(body.services.Signal).toMatch("Not ready");
  },
});
