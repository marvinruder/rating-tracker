import { describe, expect, it, vi } from "vitest";

import { getFeaturesFromCookie, isSupportedByServer } from "./serverFeatures";

/**
 * A mock document object that only contains a cookie string.
 */
class MockDocument {
  constructor(private _cookie: string) {}
  get cookie(): Document["cookie"] {
    return this._cookie;
  }
}

describe.concurrent("Server Features", () => {
  it("reads features from cookie", () => {
    vi.stubGlobal("document", new MockDocument("features=email~other-feature"));

    expect(getFeaturesFromCookie()).toEqual(["email", "other-feature"]);
    expect(isSupportedByServer("email")).toBe(true);
    expect(isSupportedByServer("oidc")).toBe(false);
  });

  it("reads no features when no cookies are set", () => {
    vi.stubGlobal("document", new MockDocument(""));

    expect(getFeaturesFromCookie()).toHaveLength(0);
    expect(isSupportedByServer("email")).toBe(false);
    expect(isSupportedByServer("oidc")).toBe(false);
  });
});
