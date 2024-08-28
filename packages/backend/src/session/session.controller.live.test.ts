import { baseURL, sessionAPIPath, accountAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Session API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "renews cookie when token is valid",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${sessionAPIPath}`);
    const res = await app.request(`${baseURL}${sessionAPIPath}`, {
      method: "HEAD",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("set-cookie")).toMatch("id=exampleSessionID;");
    expect(res.headers.get("set-cookie")).toMatch("HttpOnly; Secure; SameSite=Strict");
  },
});

tests.push({
  testName: "does not renew cookie when token is about to expire",
  testFunction: async () => {
    const res = await app.request(`${baseURL}${sessionAPIPath}`, {
      method: "HEAD",
      headers: { Cookie: "id=eolSessionID" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("set-cookie")).toBeNull();
  },
});

tests.push({
  testName: "clears cookie when token is expired",
  testFunction: async () => {
    const res = await app.request(`${baseURL}${sessionAPIPath}`, {
      method: "HEAD",
      headers: { Cookie: "id=expiredSessionID" },
    });
    expect(res.headers.get("set-cookie")).toMatch("id=;");
    expect(res.status).toBe(401);
  },
});

tests.push({
  testName: "clears cookie when token is invalid",
  testFunction: async () => {
    const res = await app.request(`${baseURL}${sessionAPIPath}`, {
      method: "HEAD",
      headers: { Cookie: "id=invalidSessionID" },
    });
    expect(res.headers.get("set-cookie")).toMatch("id=;");
    expect(res.status).toBe(401);
  },
});

tests.push({
  testName: "[unsafe] deletes session when signing out",
  testFunction: async () => {
    await expectRouteToBePrivate(`${baseURL}${sessionAPIPath}`, "DELETE");
    let res = await app.request(`${baseURL}${sessionAPIPath}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("set-cookie")).toMatch("id=;");

    // Check whether we can still access the current user
    res = await app.request(`${baseURL}${accountAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    expect(res.status).toBe(200);
    expect(Object.keys(await res.json())).toHaveLength(0);
  },
});
