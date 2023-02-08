import { isSortableAttribute } from "./SortableAttribute";

describe("Sortable Attribute", () => {
  it("is a sortable attribute", () => {
    expect(isSortableAttribute("totalScore")).toBe(true);
  });

  it("is not a sortable attribute", () => {
    expect(isSortableAttribute("totallyNotAScore")).toBe(false);
  });
});
