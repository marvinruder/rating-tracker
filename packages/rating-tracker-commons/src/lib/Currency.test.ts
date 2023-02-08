import { isCurrency } from "./Currency";

describe("Currency", () => {
  it("is a currency", () => {
    expect(isCurrency("EUR")).toBe(true);
  });

  it("is not a currency", () => {
    expect(isCurrency("HRK")).toBe(false);
  });
});
