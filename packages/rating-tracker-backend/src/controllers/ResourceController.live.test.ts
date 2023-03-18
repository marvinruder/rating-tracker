import { resourceEndpointPath } from "rating-tracker-commons";
import { LiveTestSuite, expectRouteToBePrivate, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Resource API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "provides a resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`/api${resourceEndpointPath}/image.png`);
    const res = await supertest
      .get(`/api${resourceEndpointPath}/image.png`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.toString()).toMatch("Sample PNG image");
  },
});

tests.push({
  testName: "does not provide resources of unknown type",
  testFunction: async () => {
    await expectRouteToBePrivate(`/api${resourceEndpointPath}/odd.exe`);
    const res = await supertest
      .get(`/api${resourceEndpointPath}/odd.exe`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(501);
    expect(res.body.message).toMatch("Resources of this type cannot be fetched using this API endpoint");
  },
});

tests.push({
  testName: "fails to provide not-existent resource",
  testFunction: async () => {
    await expectRouteToBePrivate(`/api${resourceEndpointPath}/doesNotExist.png`);
    const res = await supertest
      .get(`/api${resourceEndpointPath}/doesNotExist.png`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("not found");
  },
});
