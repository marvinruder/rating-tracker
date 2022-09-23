import { NebulaFighterTheme } from "src/theme/schemes/NebulaFighterTheme";
import { Industry } from "./sectors/industry";
import { getGroupFromIndustry, IndustryGroup } from "./sectors/industryGroup";
import {
  getSectorFromIndustry,
  getSectorFromIndustryGroup,
  Sector,
} from "./sectors/sector";
import {
  getColor,
  getSuperSectorFromIndustry,
  getSuperSectorFromSector,
  SuperSector,
} from "./sectors/superSector";
import { vi, describe, it, expect } from "vitest";

vi.mock("@mui/material", async () => {
  const original = await vi.importActual("@mui/material");
  return {
    ...(typeof original === "object" ? original : {}),
    useTheme: () => {
      return NebulaFighterTheme;
    },
  };
});

describe("industry groups", () => {
  it("provides exactly one industry group per industry", () => {
    Object.values(Industry).forEach((industry) =>
      expect(() => getGroupFromIndustry(industry as Industry)).not.toThrow()
    );
  });
});

describe("sectors", () => {
  it("provides exactly one sector per industry group", () => {
    Object.values(IndustryGroup).forEach((industryGroup) =>
      expect(() =>
        getSectorFromIndustryGroup(industryGroup as IndustryGroup)
      ).not.toThrow()
    );
  });

  it("provides exactly one sector per industry", () => {
    Object.values(Industry).forEach((industry) =>
      expect(() => getSectorFromIndustry(industry as Industry)).not.toThrow()
    );
  });
});

describe("super sectors", () => {
  it("provides exactly one super sector per sector", () => {
    Object.values(Sector).forEach((sector) =>
      expect(() => getSuperSectorFromSector(sector as Sector)).not.toThrow()
    );
  });

  it("provides exactly one super sector per industry", () => {
    Object.values(Industry).forEach((industry) =>
      expect(() =>
        getSuperSectorFromIndustry(industry as Industry)
      ).not.toThrow()
    );
  });

  it("provides the correct color for every super sector", () => {
    expect(getColor(SuperSector.Cyclical)).toBe(
      NebulaFighterTheme.colors.sector.cyclical
    );
    expect(getColor(SuperSector.Defensive)).toBe(
      NebulaFighterTheme.colors.sector.defensive
    );
    expect(getColor(SuperSector.Sensitive)).toBe(
      NebulaFighterTheme.colors.sector.sensitive
    );
  });
});

export default {};
