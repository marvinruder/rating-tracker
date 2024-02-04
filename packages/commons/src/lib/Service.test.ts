import { describe, expect, it } from "vitest";

import { isService } from "./Service";

describe("Sortable Attribute", () => {
  it("is a service", () => {
    expect(isService("PostgreSQL")).toBe(true);
  });

  it("is not a service", () => {
    expect(isService("Selenium")).toBe(false);
  });
});
