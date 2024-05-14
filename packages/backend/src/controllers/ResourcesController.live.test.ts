import { baseURL, resourcesAPIPath } from "@rating-tracker/commons";
import { DOMParser } from "@xmldom/xmldom";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Resources API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "provides a PNG resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${resourcesAPIPath}/image.png`);
    const res = await supertest
      .get(`${baseURL}${resourcesAPIPath}/image.png`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch("image/png");
    expect(res.body.toString()).toMatch("Sample PNG image");
  },
});

tests.push({
  testName: "provides an HTML resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${resourcesAPIPath}/page.html`);
    const res = await supertest
      .get(`${baseURL}${resourcesAPIPath}/page.html`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch("text/html");
    expect(
      new DOMParser().parseFromString(res.text, res.header["content-type"]).getElementById("hello").textContent,
    ).toBe("Hello World!");
  },
});

tests.push({
  testName: "provides a JSON resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${resourcesAPIPath}/data.json`);
    const res = await supertest
      .get(`${baseURL}${resourcesAPIPath}/data.json`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch("application/json");
    expect(res.body.foo).toBe("bar");
  },
});

tests.push({
  testName: "does not provide resources of unknown type",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${resourcesAPIPath}/odd.exe`);
    const res = await supertest
      .get(`${baseURL}${resourcesAPIPath}/odd.exe`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(501);
    expect(res.body.message).toMatch("Resources of this type cannot be fetched using this API endpoint");
  },
});

tests.push({
  testName: "fails to provide not-existent resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${resourcesAPIPath}/doesNotExist.png`);
    const res = await supertest
      .get(`${baseURL}${resourcesAPIPath}/doesNotExist.png`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("not found");
  },
});
