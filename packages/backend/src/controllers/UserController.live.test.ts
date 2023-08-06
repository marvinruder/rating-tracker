import { sessionEndpointPath, userEndpointPath } from "@rating-tracker/commons";
import { LiveTestSuite, expectRouteToBePrivate, supertest } from "../../test/liveTestHelpers";

export const suiteName = "User API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "provides current user’s information",
  testFunction: async () => {
    await expectRouteToBePrivate(`/api${userEndpointPath}`);
    const res = await supertest.get(`/api${userEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jane.doe@example.com");
    expect(res.body.name).toBe("Jane Doe");
    expect(res.body.avatar).toBe("data:image/jpeg;base64,U29tZSBmYW5jeSBhdmF0YXIgaW1hZ2U=");
    expect(res.body.phone).toBe("+123456789");
    // Authentication-related fields should not be exposed
    expect(res.body.credentialID).toBeUndefined();
    expect(res.body.credentialPublicKey).toBeUndefined();
    expect(res.body.counter).toBeUndefined();
  },
});

tests.push({
  testName: "validates the phone number",
  testFunction: async () => {
    await expectRouteToBePrivate(`/api${userEndpointPath}`, supertest.patch);
    let res = await supertest
      .patch(`/api${userEndpointPath}?phone=987654321`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
    res = await supertest
      .patch(`/api${userEndpointPath}?phone=+1%20234%20567%2D8900`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);

    // Check that no changes were applied
    res = await supertest.get(`/api${userEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.phone).toBe("+123456789");
  },
});

tests.push({
  testName: "[unsafe] updates current user’s information",
  testFunction: async () => {
    await expectRouteToBePrivate(`/api${userEndpointPath}`, supertest.patch);
    let res = await supertest
      .patch(`/api${userEndpointPath}?name=Jane%20Doe%20II%2E&phone=%2B987654321&email=jane.doe.2%40example%2Ecom`)
      .send({
        avatar: "data:image/jpeg;base64,QW5vdGhlciBmYW5jeSBhdmF0YXIgaW1hZ2U=",
      })
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await supertest.get(`/api${userEndpointPath}`).set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jane.doe.2@example.com");
    expect(res.body.name).toBe("Jane Doe II.");
    expect(res.body.avatar).toBe("data:image/jpeg;base64,QW5vdGhlciBmYW5jeSBhdmF0YXIgaW1hZ2U=");
    expect(res.body.phone).toBe("+987654321");
  },
});

tests.push({
  testName: "disallows changing own access rights",
  testFunction: async () => {
    const res = await supertest
      .patch(`/api${userEndpointPath}?accessRights=255`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(400);
  },
});

tests.push({
  testName: "[unsafe] deletes the current user",
  testFunction: async () => {
    await expectRouteToBePrivate(`/api${userEndpointPath}`, supertest.delete);
    let res = await supertest.delete(`/api${userEndpointPath}`).set("Cookie", ["authToken=anotherExampleSessionID"]);

    // Check that the user was deleted
    res = await supertest.head(`/api${sessionEndpointPath}`).set("Cookie", ["authToken=anotherExampleSessionID"]);
    expect(res.status).toBe(401);
  },
});
