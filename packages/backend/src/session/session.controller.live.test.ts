import { basePath, sessionAPIPath, accountAPIPath } from "@rating-tracker/commons";

import type { LiveTestSuite } from "../../test/liveTestHelpers";
import { expectRouteToBePrivate } from "../../test/liveTestHelpers";
import { app } from "../server";

export const suiteName = "Session API";

export const tests: LiveTestSuite = [];

tests.push({
  testName: "renews cookie when token is valid",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${sessionAPIPath}`);
    const res = await app.request(`${basePath}${sessionAPIPath}`, {
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
    const res = await app.request(`${basePath}${sessionAPIPath}`, {
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
    const res = await app.request(`${basePath}${sessionAPIPath}`, {
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
    const res = await app.request(`${basePath}${sessionAPIPath}`, {
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
    await expectRouteToBePrivate(`${basePath}${sessionAPIPath}`, "DELETE");
    let res = await app.request(`${basePath}${sessionAPIPath}`, {
      method: "DELETE",
      headers: { Cookie: "id=anotherExampleSessionID" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("set-cookie")).toMatch("id=;");

    // Check whether we can still access the current user
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: "id=anotherExampleSessionID" } });
    expect(res.status).toBe(200);
    expect(Object.keys(await res.json())).toHaveLength(0);
  },
});

tests.push({
  testName: "[unsafe] returns front-channel logout URI when signing out after signing in with OpenID Connect",
  testFunction: async () => {
    await expectRouteToBePrivate(`${basePath}${sessionAPIPath}`, "DELETE");
    let res = await app.request(`${basePath}${sessionAPIPath}`, {
      method: "DELETE",
      headers: { Cookie: "id=exampleSessionID" },
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.frontchannelLogoutURI).toMatch(
      "https://sso.example.com/protocol/openid-connect/logout?client_id=rating-tracker&id_token_hint=exampleIDToken&" +
        `post_logout_redirect_uri=${encodeURIComponent("https://subdomain.example.com/login?origin=oidc_post_logout")}`,
    );
    expect(res.headers.get("set-cookie")).toMatch("id=;");

    // Check whether we can still access the current user
    res = await app.request(`${basePath}${accountAPIPath}`, { headers: { Cookie: "id=exampleSessionID" } });
    expect(res.status).toBe(200);
    expect(Object.keys(await res.json())).toHaveLength(0);
  },
});
