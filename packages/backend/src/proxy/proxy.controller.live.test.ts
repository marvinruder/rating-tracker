import { basePath, proxyAPIPath, yahooFinanceEndpointSuffix } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Proxy API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "provides a list of stock stubs",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${proxyAPIPath}${yahooFinanceEndpointSuffix}?q=app`);

    // The `q` parameter is required.
    let res = await app.request(`${basePath}${proxyAPIPath}${yahooFinanceEndpointSuffix}`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(400);

    res = await app.request(`${basePath}${proxyAPIPath}${yahooFinanceEndpointSuffix}?q=app`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    let body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(6);
    expect(body).toContainEqual({
      ticker: "AAPL",
      name: "Apple Inc.",
      logoUrl: "data:image/png;base64,AVeryFancyStockLogo=",
      industry: "ConsumerElectronics",
    });
    expect(body).toContainEqual({
      ticker: "AMAT",
      name: "Applied Materials, Inc.",
      logoUrl: null,
      industry: "SemiconductorEquipmentMaterials",
    });

    res = await app.request(`${basePath}${proxyAPIPath}${yahooFinanceEndpointSuffix}?q=aaaaaaaa`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(0);
  },
});
