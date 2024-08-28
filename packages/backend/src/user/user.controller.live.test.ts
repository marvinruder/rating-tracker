import type { User } from "@rating-tracker/commons";
import { baseURL, usersAvatarEndpointSuffix, usersAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate, expectSpecialAccessRightsToBeRequired } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Users API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "returns a list of users",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${usersAPIPath}`);
    await expectSpecialAccessRightsToBeRequired(`${baseURL}${usersAPIPath}`);
    const res = await app.request(`${baseURL}${usersAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body.find((user: User) => user.email === "jane.doe@example.com")!.name).toMatch("Jane Doe");
  },
});

tests.push({
  testName: "reads a user",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`);
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`,
    );
    let res = await app.request(`${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toEqual("John Doe");
    // Authentication-related fields should not be exposed
    expect(body.credentialID).toBeUndefined();
    expect(body.credentialPublicKey).toBeUndefined();
    expect(body.counter).toBeUndefined();

    // attempting to read a non-existent user results in an error
    res = await app.request(`${baseURL}${usersAPIPath}/does.not.exist@example.com`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "reads a user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("jane.doe@example.com")}${usersAvatarEndpointSuffix}`,
    );
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("jane.doe@example.com")}${usersAvatarEndpointSuffix}`,
    );
    let res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("jane.doe@example.com")}${usersAvatarEndpointSuffix}`,
      { headers: { Cookie: "id=exampleSessionID" } },
    );
    const body = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(body).toMatch("Some fancy avatar image");

    // attempting to read a non-existent user’s avatar results in an error
    res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("does.not.exist@example.com")}${usersAvatarEndpointSuffix}`,
      { headers: { Cookie: "id=exampleSessionID" } },
    );
    expect(res.status).toBe(404);

    // attempting to read a user’s avatar when the user does not have one results in an error
    res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}${usersAvatarEndpointSuffix}`,
      { headers: { Cookie: "id=exampleSessionID" } },
    );
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] updates a user’s information",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`, "PATCH");
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`,
      "PATCH",
    );
    let res = await app.request(`${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({
        email: "john.doe.2@example.com",
        name: "John Doe II.",
        phone: "+987654321",
        accessRights: 1,
        subscriptions: 0,
      }),
    });
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await app.request(`${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe.2@example.com")}`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("john.doe.2@example.com");
    expect(body.name).toBe("John Doe II.");
    expect(body.phone).toBe("+987654321");

    // Changing nothing is useless, but fine
    res = await app.request(`${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe.2@example.com")}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(204);

    // Changing no one is not fine
    res = await app.request(`${baseURL}${usersAPIPath}/${encodeURIComponent("does.not.exist@example.com")}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ subscriptions: 0 }),
    });
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] updates a user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}${usersAvatarEndpointSuffix}`,
      "PUT",
    );
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}${usersAvatarEndpointSuffix}`,
      "PUT",
    );

    // Only certain media types are allowed
    let res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}${usersAvatarEndpointSuffix}`,
      {
        method: "PUT",
        headers: { "content-type": "image/jpeg", Cookie: "id=exampleSessionID" },
        body: "Another fancy avatar image",
      },
    );
    expect(res.status).toBe(415);

    // No media type is also not allowed
    res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}${usersAvatarEndpointSuffix}`,
      { method: "PUT", headers: { Cookie: "id=exampleSessionID" }, body: "Another fancy avatar image" },
    );
    expect(res.status).toBe(415);

    // Very large avatars are also not allowed
    res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}${usersAvatarEndpointSuffix}`,
      {
        method: "PUT",
        headers: { "content-type": "image/avif", Cookie: "id=exampleSessionID" },
        body: "A".repeat(1024 * 1024 + 1),
      },
    );
    expect(res.status).toBe(413);

    res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}${usersAvatarEndpointSuffix}`,
      {
        method: "PUT",
        headers: { "content-type": "image/avif", Cookie: "id=exampleSessionID" },
        body: "Another fancy avatar image",
      },
    );
    expect(res.status).toBe(201);

    // Check that the changes were applied
    res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}${usersAvatarEndpointSuffix}`,
      { headers: { Cookie: "id=exampleSessionID" } },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/avif");
    expect(await res.text()).toMatch("Another fancy avatar image");
  },
});

tests.push({
  testName: "[unsafe] deletes a user",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`, "DELETE");
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`,
      "DELETE",
    );

    // Delete the user
    let res = await app.request(`${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Deleting the same user again does not return an error
    res = await app.request(`${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Check that the user was deleted
    res = await app.request(`${baseURL}${usersAPIPath}/${encodeURIComponent("john.doe@example.com")}`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(404);
  },
});

tests.push({
  testName: "[unsafe] deletes a user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("jane.doe@example.com")}${usersAvatarEndpointSuffix}`,
      "DELETE",
    );
    await expectSpecialAccessRightsToBeRequired(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("jane.doe@example.com")}${usersAvatarEndpointSuffix}`,
      "DELETE",
    );

    // Delete the user’s avatar
    let res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("jane.doe@example.com")}${usersAvatarEndpointSuffix}`,
      { method: "DELETE", headers: { Cookie: "id=exampleSessionID" } },
    );
    expect(res.status).toBe(204);

    // Deleting the same user’s avatar again does not return an error
    res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("jane.doe@example.com")}${usersAvatarEndpointSuffix}`,
      { method: "DELETE", headers: { Cookie: "id=exampleSessionID" } },
    );
    expect(res.status).toBe(204);

    // Check that the avatar was deleted
    res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("jane.doe@example.com")}${usersAvatarEndpointSuffix}`,
      { headers: { Cookie: "id=exampleSessionID" } },
    );
    expect(res.status).toBe(404);

    // attempting to delete a non-existent user’s avatar returns an error
    res = await app.request(
      `${baseURL}${usersAPIPath}/${encodeURIComponent("does.not.exist@example.com")}${usersAvatarEndpointSuffix}`,
      { method: "DELETE", headers: { Cookie: "id=exampleSessionID" } },
    );
    expect(res.status).toBe(404);
  },
});
