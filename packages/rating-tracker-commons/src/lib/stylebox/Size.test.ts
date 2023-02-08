import { isSize } from "./Size";

describe("Size", () => {
  it("is a size", () => {
    expect(isSize("Small")).toBe(true);
  });

  it("is not a size", () => {
    expect(isSize("Smol")).toBe(false);
  });
});
