import { isSize } from "./Size";
import { describe, expect, it } from "vitest";

describe("Size", () => {
  it("is a size", () => {
    expect(isSize("Small")).toBe(true);
  });

  it("is not a size", () => {
    expect(isSize("smol")).toBe(false);
  });
});
