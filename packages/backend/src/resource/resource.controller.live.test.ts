import { basePath, resourcesAPIPath } from "@rating-tracker/commons";
import { DOMParser, MIME_TYPE } from "@xmldom/xmldom";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Resources API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "provides a PNG resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${resourcesAPIPath}/image.png`);
    const res = await app.request(`${basePath}${resourcesAPIPath}/image.png`, {
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
    await expectRouteToBePrivate(`${basePath}${resourcesAPIPath}/page.html`);
    const res = await app.request(`${basePath}${resourcesAPIPath}/page.html`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch("text/html");
    expect(
      (new DOMParser().parseFromString(await res.text(), MIME_TYPE.HTML) as unknown as Document).getElementById(
        "hello",
      )!.textContent,
    ).toBe("Hello World!");
  },
});

tests.push({
  testName: "provides a JSON resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${resourcesAPIPath}/data.json`);
    const res = await app.request(`${basePath}${resourcesAPIPath}/data.json`, {
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
    await expectRouteToBePrivate(`${basePath}${resourcesAPIPath}/expired.json`);
    const res = await app.request(`${basePath}${resourcesAPIPath}/expired.json`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(404);
    expect((await res.json())?.foo).not.toBe("bar");
  },
});

tests.push({
  testName: "fails to provide not-existent resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${resourcesAPIPath}/doesNotExist`);
    const res = await app.request(`${basePath}${resourcesAPIPath}/doesNotExist`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    const body = await res.json();
    expect(res.status).toBe(404);
    expect(body.message).toMatch("not found");
  },
});
