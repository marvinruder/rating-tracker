import { describe, expect, it } from "vitest";

import { isSortableAttribute } from "./SortableAttribute";

describe.concurrent("Sortable Attribute", () => {
  it("is a sortable attribute", () => {
    expect(isSortableAttribute("totalScore")).toBe(true);
  });

  it("is not a sortable attribute", () => {
    expect(isSortableAttribute("totallyNotAScore")).toBe(false);
  });
});
