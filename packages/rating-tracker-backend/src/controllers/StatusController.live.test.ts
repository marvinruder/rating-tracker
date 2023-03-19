import { statusEndpointPath } from "rating-tracker-commons";
import { LiveTestSuite, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Status API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "returns status “operational”",
  testFunction: async () => {
    const res = await supertest.get(`/api${statusEndpointPath}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("operational");
  },
});
