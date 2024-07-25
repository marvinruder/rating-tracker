import type { User } from "@rating-tracker/commons";
import { baseURL, usersAvatarEndpointSuffix, usersAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate, expectSpecialAccessRightsToBeRequired, supertest } from "../../test/liveTestHelpers";

export const suiteName = "Users API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "returns a list of users",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${usersAPIPath}`);
    await expectSpecialAccessRightsToBeRequired(`${baseURL}${usersAPIPath}`);
    const res = await supertest.get(`${baseURL}${usersAPIPath}`).set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect((res.body as User[]).find((user) => user.email === "jane.doe@example.com").name).toMatch("Jane Doe");
  },
});

tests.push({
  testName: "reads a user",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${usersAPIPath}/john.doe%40example.com`);
    await expectSpecialAccessRightsToBeRequired(`${baseURL}${usersAPIPath}/john.doe%40example.com`);
    let res = await supertest
      .get(`${baseURL}${usersAPIPath}/john.doe%40example.com`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.name).toEqual("John Doe");
    // Authentication-related fields should not be exposed
    expect(res.body.credentialID).toBeUndefined();
    expect(res.body.credentialPublicKey).toBeUndefined();
    expect(res.body.counter).toBeUndefined();

    // attempting to read a non-existent user results in an error
    res = await supertest
      .get(`${baseURL}${usersAPIPath}/doesNotExist@example.com`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "reads a user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${usersAPIPath}/jane.doe%40example.com${usersAvatarEndpointSuffix}`);
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${usersAPIPath}/jane.doe%40example.com${usersAvatarEndpointSuffix}`,
    );
    let res = await supertest
      .get(`${baseURL}${usersAPIPath}/jane.doe%40example.com${usersAvatarEndpointSuffix}`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/jpeg");
    expect((res.body as Buffer).toString("ascii")).toMatch("Some fancy avatar image");

    // attempting to read a non-existent user’s avatar results in an error
    res = await supertest
      .get(`${baseURL}${usersAPIPath}/doesNotExist%40example.com${usersAvatarEndpointSuffix}`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(404);

    // attempting to read a user’s avatar when the user does not have one results in an error
    res = await supertest
      .get(`${baseURL}${usersAPIPath}/john.doe%40example.com${usersAvatarEndpointSuffix}`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] updates a user’s information",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${usersAPIPath}/john.doe%40example.com`, supertest.patch);
    await expectSpecialAccessRightsToBeRequired(`${baseURL}${usersAPIPath}/john.doe%40example.com`, supertest.patch);
    let res = await supertest
      .patch(
        `${baseURL}${usersAPIPath}/john.doe%40example.com` +
          "?name=John%20Doe%20II%2E&phone=%2B987654321&accessRights=1&subscriptions=0&email=john.doe.2%40example.com",
      )
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await supertest
      .get(`${baseURL}${usersAPIPath}/john.doe.2%40example.com`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("john.doe.2@example.com");
    expect(res.body.name).toBe("John Doe II.");
    expect(res.body.phone).toBe("+987654321");

    // Changing nothing is useless, but fine
    res = await supertest
      .patch(`${baseURL}${usersAPIPath}/john.doe.2%40example.com?subscriptions=0`) // we did that before
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Changing no one is not fine
    res = await supertest
      .patch(`${baseURL}${usersAPIPath}/noreply%40example.com?subscriptions=0`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] updates a user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(
      `${baseURL}${usersAPIPath}/john.doe%40example.com${usersAvatarEndpointSuffix}`,
      supertest.put,
      "image/avif",
    );
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${usersAPIPath}/john.doe%40example.com${usersAvatarEndpointSuffix}`,
      supertest.put,
      "image/avif",
    );

    // Only certain media types are allowed
    let res = await supertest
      .put(`${baseURL}${usersAPIPath}/john.doe%40example.com${usersAvatarEndpointSuffix}`)
      .set("Content-Type", "image/png")
      .send("Some fancy avatar image")
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(415);

    res = await supertest
      .put(`${baseURL}${usersAPIPath}/john.doe%40example.com${usersAvatarEndpointSuffix}`)
      .set("Content-Type", "image/avif")
      .send("Another fancy avatar image")
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(201);

    // Check that the changes were applied
    const avatar = await supertest
      .get(`${baseURL}${usersAPIPath}/john.doe%40example.com${usersAvatarEndpointSuffix}`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(avatar.status).toBe(200);
    expect(avatar.headers["content-type"]).toBe("image/avif");
    expect((avatar.body as Buffer).toString("ascii")).toMatch("Another fancy avatar image");
  },
});

tests.push({
  testName: "[unsafe] deletes a user",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${usersAPIPath}/john.doe%40example.com`, supertest.delete);
    await expectSpecialAccessRightsToBeRequired(`${baseURL}${usersAPIPath}/john.doe%40example.com`, supertest.delete);
    let res = await supertest
      .delete(`${baseURL}${usersAPIPath}/john.doe%40example.com`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the user was deleted
    res = await supertest
      .get(`${baseURL}${usersAPIPath}/john.doe%40example.com`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(404);

    // attempting to delete a non-existent stock returns an error
    res = await supertest
      .delete(`${baseURL}${usersAPIPath}/john.doe%40example.com`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] deletes a user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(
      `${baseURL}${usersAPIPath}/jane.doe%40example.com${usersAvatarEndpointSuffix}`,
      supertest.delete,
    );
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${usersAPIPath}/jane.doe%40example.com${usersAvatarEndpointSuffix}`,
      supertest.delete,
    );
    let res = await supertest
      .delete(`${baseURL}${usersAPIPath}/jane.doe%40example.com${usersAvatarEndpointSuffix}`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(204);

    // Check that the avatar was deleted
    res = await supertest
      .get(`${baseURL}${usersAPIPath}/jane.doe%40example.com${usersAvatarEndpointSuffix}`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(404);

    // attempting to delete a non-existent user’s avatar returns an error
    res = await supertest
      .delete(`${baseURL}${usersAPIPath}/doesNotExist%40example.com${usersAvatarEndpointSuffix}`)
      .set("Cookie", ["id=exampleSessionID"]);
    expect(res.status).toBe(404);
  },
});
