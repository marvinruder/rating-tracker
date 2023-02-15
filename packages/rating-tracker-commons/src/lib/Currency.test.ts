import { isCurrency } from "./Currency";
import { describe, expect, it } from "vitest";

describe("Currency", () => {
  it("is a currency", () => {
    expect(isCurrency("EUR")).toBe(true);
  });

  it("is not a currency", () => {
    expect(isCurrency("HRK")).toBe(false);
  });
});
