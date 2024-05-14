import { describe, expect, it } from "vitest";

import { isSize } from "./Size";

describe.concurrent("Size", () => {
  it("is a size", () => {
    expect(isSize("Small")).toBe(true);
  });

  it("is not a size", () => {
    expect(isSize("smol")).toBe(false);
  });
});
