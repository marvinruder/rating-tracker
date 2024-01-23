import type { LiveTestSuite } from "../test/liveTestHelpers";
import { supertest } from "../test/liveTestHelpers";

export const suiteName = "Other Server Components";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "provides OpenAPI documentation",
  testFunction: async () => {
    const res = await supertest.get("/api-spec/v3");
    expect(res.status).toBe(200);
  },
});
