import { isSortableAttribute } from "./SortableAttribute";
import { describe, expect, it } from "vitest";

describe("Sortable Attribute", () => {
  it("is a sortable attribute", () => {
    expect(isSortableAttribute("totalScore")).toBe(true);
  });

  it("is not a sortable attribute", () => {
    expect(isSortableAttribute("totallyNotAScore")).toBe(false);
  });
});
