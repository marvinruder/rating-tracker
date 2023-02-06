import { isStyle } from "./Style";

describe("Style", () => {
  it("is a style", () => {
    expect(isStyle("Blend")).toBe(true);
  });

  it("is not a style", () => {
    expect(isStyle("Core")).toBe(false);
  });
});
