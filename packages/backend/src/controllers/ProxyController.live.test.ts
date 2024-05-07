import { baseURL, proxyEndpointPath, yahooFinanceEndpointSuffix } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Proxy API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "provides a list of stock stubs",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${proxyEndpointPath}${yahooFinanceEndpointSuffix}?q=app`);

    // The `q` parameter is required.
    let res = await supertest
      .get(`${baseURL}${proxyEndpointPath}${yahooFinanceEndpointSuffix}`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);

    res = await supertest
      .get(`${baseURL}${proxyEndpointPath}${yahooFinanceEndpointSuffix}?q=app`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    expect(res.body).toContainEqual({
      ticker: "AAPL",
      name: "Apple Inc.",
      logoUrl: "https://s.yimg.com/lb/brands/150x150_apple.png",
      industry: "ConsumerElectronics",
    });
    expect(res.body).toContainEqual({
      ticker: "AMAT",
      name: "Applied Materials, Inc.",
      logoUrl: null,
      industry: "SemiconductorEquipmentMaterials",
    });

    res = await supertest
      .get(`${baseURL}${proxyEndpointPath}${yahooFinanceEndpointSuffix}?q=aaaaaaaa`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  },
});
