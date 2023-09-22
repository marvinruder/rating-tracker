import { describe, expect, it } from "vitest";

import { isIndustryGroup, getIndustriesInGroup } from "./IndustryGroup";

describe("Industry Group", () => {
  it("is an industry group", () => {
    expect(isIndustryGroup("RetailCyclical")).toBe(true);
  });

  it("is not an industry group", () => {
    expect(isIndustryGroup("RetailAnticyclical")).toBe(false);
  });

  it("contains industries", () => {
    expect(getIndustriesInGroup("Hardware")).toEqual([
      "CommunicationEquipment",
      "ComputerHardware",
      "ConsumerElectronics",
      "ElectronicComponents",
      "ElectronicsComputerDistribution",
      "ScientificTechnicalInstruments",
    ]);
  });
});
