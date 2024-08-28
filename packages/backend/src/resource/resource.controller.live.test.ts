import { baseURL, resourcesAPIPath } from "@rating-tracker/commons";
import { DOMParser } from "@xmldom/xmldom";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Resources API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "provides a PNG resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${resourcesAPIPath}/image.png`);
    const res = await app.request(`${baseURL}${resourcesAPIPath}/image.png`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch("image/png");
    expect(await res.text()).toMatch("Sample PNG image");
  },
});

tests.push({
  testName: "provides an HTML resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${resourcesAPIPath}/page.html`);
    const res = await app.request(`${baseURL}${resourcesAPIPath}/page.html`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch("text/html");
    expect(
      new DOMParser().parseFromString(await res.text(), res.headers.get("content-type")!).getElementById("hello")!
        .textContent,
    ).toBe("Hello World!");
  },
});

tests.push({
  testName: "provides a JSON resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${resourcesAPIPath}/data.json`);
    const res = await app.request(`${baseURL}${resourcesAPIPath}/data.json`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch("application/json");
    expect((await res.json()).foo).toBe("bar");
  },
});

tests.push({
  testName: "does not provide an expired resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${resourcesAPIPath}/expired.json`);
    const res = await app.request(`${baseURL}${resourcesAPIPath}/expired.json`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(404);
    expect((await res.json())?.foo).not.toBe("bar");
  },
});

tests.push({
  testName: "fails to provide not-existent resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${resourcesAPIPath}/doesNotExist`);
    const res = await app.request(`${baseURL}${resourcesAPIPath}/doesNotExist`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("not found");
  },
});
