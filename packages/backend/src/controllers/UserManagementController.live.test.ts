import { User, UserWithCredentials, baseURL, userManagementEndpointPath } from "@rating-tracker/commons";

import {
  LiveTestSuite,
  expectRouteToBePrivate,
  expectSpecialAccessRightsToBeRequired,
  supertest,
} from "../../test/liveTestHelpers";

export const suiteName = "User Management API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "returns a list of users",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${userManagementEndpointPath}/list`);
    await expectSpecialAccessRightsToBeRequired(`${baseURL}${userManagementEndpointPath}/list`);
    const res = await supertest
      .get(`${baseURL}${userManagementEndpointPath}/list`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect((res.body as User[]).find((user) => user.email === "jane.doe@example.com").name).toMatch("Jane Doe");
    (res.body as UserWithCredentials[]).forEach((user) => {
      expect(user.credentialID).toBeUndefined();
      expect(user.credentialPublicKey).toBeUndefined();
      expect(user.counter).toBeUndefined();
    });
  },
});

tests.push({
  testName: "reads a user",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${userManagementEndpointPath}/john.doe%40example.com`);
    await expectSpecialAccessRightsToBeRequired(`${baseURL}${userManagementEndpointPath}/john.doe%40example.com`);
    let res = await supertest
      .get(`${baseURL}${userManagementEndpointPath}/john.doe%40example.com`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toEqual("John Doe");
    // Authentication-related fields should not be exposed
    expect(res.body.credentialID).toBeUndefined();
    expect(res.body.credentialPublicKey).toBeUndefined();
    expect(res.body.counter).toBeUndefined();

    // attempting to read a non-existent user results in an error
    res = await supertest
      .get(`${baseURL}${userManagementEndpointPath}/doesNotExist@example.com`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] updates a user’s information",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${userManagementEndpointPath}/john.doe%40example.com`, supertest.patch);
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${userManagementEndpointPath}/john.doe%40example.com`,
      supertest.patch,
    );
    let res = await supertest
      .patch(
        `${baseURL}${userManagementEndpointPath}/john.doe%40example.com` +
          "?name=John%20Doe%20II%2E&phone=%2B987654321&accessRights=1&subscriptions=0&email=john.doe.2%40example.com",
      )
      .send({
        avatar: "data:image/jpeg;base64,QW5vdGhlciBmYW5jeSBhdmF0YXIgaW1hZ2U=",
      })
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await supertest
      .get(`${baseURL}${userManagementEndpointPath}/john.doe.2%40example.com`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("john.doe.2@example.com");
    expect(res.body.name).toBe("John Doe II.");
    expect(res.body.avatar).toBe("data:image/jpeg;base64,QW5vdGhlciBmYW5jeSBhdmF0YXIgaW1hZ2U=");
    expect(res.body.phone).toBe("+987654321");

    // Changing nothing is useless, but fine
    res = await supertest
      .patch(`${baseURL}${userManagementEndpointPath}/john.doe.2%40example.com?subscriptions=0`) // we did that before
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Changing no one is not fine
    res = await supertest
      .patch(`${baseURL}${userManagementEndpointPath}/noreply%40example.com?subscriptions=0`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] deletes a user",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${userManagementEndpointPath}/john.doe%40example.com`, supertest.delete);
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${userManagementEndpointPath}/john.doe%40example.com`,
      supertest.delete,
    );
    let res = await supertest
      .delete(`${baseURL}${userManagementEndpointPath}/john.doe%40example.com`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the user was deleted
    res = await supertest
      .get(`${baseURL}${userManagementEndpointPath}/john.doe%40example.com`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);

    // attempting to delete a non-existent stock returns an error
    res = await supertest
      .delete(`${baseURL}${userManagementEndpointPath}/john.doe%40example.com`)
      .set("Cookie", ["authToken=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});
