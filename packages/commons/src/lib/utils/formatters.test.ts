import { describe, expect, it } from "vitest";

import { pluralize } from "./formatters";

describe("Formatters", () => {
  it("should format in singular when input is ±1", () => {
    expect(pluralize(1)).toBe("");
    expect(pluralize(-1)).toBe("");
  });

  it("should format in plural when input is not ±1", () => {
    expect(pluralize(0)).toBe("s");
    expect(pluralize(2)).toBe("s");
    expect(pluralize(3)).toBe("s");
    expect(pluralize(-5)).toBe("s");
  });
});
