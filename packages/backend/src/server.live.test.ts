import type { LiveTestSuite } from "../test/liveTestHelpers";

import { app } from "./server";

export const suiteName = "Other Server Components";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "provides OpenAPI documentation",
  testFunction: async () => {
    const res = await app.request("/api-spec/v3.1");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch("application/json");
  },
});

tests.push({
  testName: "provides Swagger UI",
  testFunction: async () => {
    const res = await app.request("/api-docs");
    const body = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch("text/html");
    expect(body).toContain("https://cdn.jsdelivr.net/npm/swagger-ui-dist/");
  },
});
