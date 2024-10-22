import assert from "node:assert";

import { accountAPIPath, accountAvatarEndpointSuffix, basePath, sessionAPIPath } from "@rating-tracker/commons";

import { expectRouteToBePrivate, type LiveTestSuite } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Account API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "returns empty object when no user is logged in",
  testFunction: async () => {
    const res = await app.request(`${basePath}${accountAPIPath}`);
    expect(res.status).toBe(200);
    expect(Object.keys(await res.json())).toHaveLength(0);
  },
});

tests.push({
  testName: "provides current user’s information",
  testFunction: async () => {
    const res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    assert(!("message" in body));
    expect(body.email).toBe("jane.doe@example.com");
    expect(body.name).toBe("Jane Doe");
    expect(body.phone).toBe("+123456789");
    // Authentication-related fields should not be exposed
    expect("credentialID" in body).toBeFalsy();
    expect("credentialPublicKey" in body).toBeFalsy();
    expect("counter" in body).toBeFalsy();
  },
});

tests.push({
  testName: "provides current user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`);
    const res = await app.request(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    const body = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(body).toMatch("Some fancy avatar image");
  },
});

tests.push({
  testName: "validates the phone number",
  testFunction: async () => {
    let res = await app.request(`${basePath}${accountAPIPath}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ phone: "987654321" }),
    });
    expect(res.status).toBe(400);
    res = await app.request(`${basePath}${accountAPIPath}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ phone: "+1 (234) 567-8900" }),
    });
    expect(res.status).toBe(400);

    // Check that no changes were applied
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.phone).toBe("+123456789");
  },
});

tests.push({
  testName: "[unsafe] updates current user’s email address",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${accountAPIPath}`, "PATCH");
    let res = await app.request(`${basePath}${accountAPIPath}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ email: "jane.doe.2@example.com" }),
    });
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("jane.doe.2@example.com");
  },
});

tests.push({
  testName: "[unsafe] updates current user’s information without email address",
  testFunction: async () => {
    let res = await app.request(`${basePath}${accountAPIPath}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ name: "Jane Doe II.", phone: "+987654321" }),
    });
    expect(res.status).toBe(204);

    // Check that the changes were applied
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.email).toBe("jane.doe@example.com");
    expect(body.name).toBe("Jane Doe II.");
    expect(body.phone).toBe("+987654321");
  },
});

tests.push({
  testName: "[unsafe] updates current user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, "PUT");

    // Only certain media types are allowed
    let res = await app.request(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, {
      method: "PUT",
      headers: { "content-type": "image/jpeg", Cookie: "id=exampleSessionID" },
      body: "Another fancy avatar image",
    });
    expect(res.status).toBe(415);

    // No media type is also not allowed
    res = await app.request(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, {
      method: "PUT",
      headers: { Cookie: "id=exampleSessionID" },
      body: "Another fancy avatar image",
    });
    expect(res.status).toBe(415);

    // Very large avatars are also not allowed
    res = await app.request(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, {
      method: "PUT",
      headers: { "content-type": "image/avif", Cookie: "id=exampleSessionID" },
      body: "A".repeat(1024 * 1024 + 1),
    });
    expect(res.status).toBe(413);

    res = await app.request(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, {
      method: "PUT",
      headers: { "content-type": "image/avif", Cookie: "id=exampleSessionID" },
      body: "Another fancy avatar image",
    });
    expect(res.status).toBe(201);

    // Check that the changes were applied
    res = await app.request(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/avif");
    expect(await res.text()).toMatch("Another fancy avatar image");
  },
});

tests.push({
  testName: "disallows changing own access rights",
  testFunction: async () => {
    const res = await app.request(`${basePath}${accountAPIPath}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", Cookie: "id=exampleSessionID" },
      body: JSON.stringify({ accessRights: 255 }),
    });
    expect(res.status).toBe(400);
  },
});

tests.push({
  testName: "[unsafe] deletes the current user",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${accountAPIPath}`, "DELETE");
    let res = await app.request(`${basePath}${accountAPIPath}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });

    // Check that the user was deleted
    res = await app.request(`${basePath}${sessionAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    expect(res.status).toBe(401);
  },
});

tests.push({
  testName: "[unsafe] deletes the current user’s avatar",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, "DELETE");

    // Delete the avatar
    let res = await app.request(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Deleting the avatar again does not return an error
    res = await app.request(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);

    // Check that the avatar was deleted
    res = await app.request(`${basePath}${accountAPIPath}${accountAvatarEndpointSuffix}`, {
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(404);
  },
});
