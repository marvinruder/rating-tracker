import { NebulaFighterTheme } from "src/theme/schemes/NebulaFighterTheme";
import { getIndustryKey, Industry } from "./sectors/industry";
import {
  getGroupFromIndustry,
  getIndustriesInGroup,
  IndustryGroup,
} from "./sectors/industryGroup";
import {
  getIndustryGroupsInSector,
  getSectorFromIndustry,
  getSectorFromIndustryGroup,
  Sector,
} from "./sectors/sector";
import {
  getColor,
  getSectorsInSuperSector,
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

describe("industries", () => {
  it("provides the correct industry keys", () => {
    Object.values(Industry).forEach((industry) =>
      expect(Object.keys(Industry)).toContain(getIndustryKey(industry))
    );
  });

  it("allows for creation of industry key from industry text", () => {
    Object.values(Industry).forEach((industry: string) =>
      expect(Object.keys(Industry)).toContain(
        industry.replaceAll(/[^a-zA-Z0-9]/g, "")
      )
    );
  });
});

describe("industry groups", () => {
  it("provides exactly one industry group per industry", () => {
    Object.values(Industry).forEach((industry) =>
      expect(() => getGroupFromIndustry(industry)).not.toThrow()
    );
  });

  it("provides the correct industries in industry group", () => {
    Object.values(Industry).forEach((industry) =>
      expect(getIndustriesInGroup(getGroupFromIndustry(industry))).toContain(
        industry
      )
    );
  });
});

describe("sectors", () => {
  it("provides exactly one sector per industry group", () => {
    Object.values(IndustryGroup).forEach((industryGroup) =>
      expect(() => getSectorFromIndustryGroup(industryGroup)).not.toThrow()
    );
  });

  it("provides the correct industry groups in sector", () => {
    Object.values(IndustryGroup).forEach((industryGroup) =>
      expect(
        getIndustryGroupsInSector(getSectorFromIndustryGroup(industryGroup))
      ).toContain(industryGroup)
    );
  });

  it("provides exactly one sector per industry", () => {
    Object.values(Industry).forEach((industry) =>
      expect(() => getSectorFromIndustry(industry)).not.toThrow()
    );
  });
});

describe("super sectors", () => {
  it("provides exactly one super sector per sector", () => {
    Object.values(Sector).forEach((sector) =>
      expect(() => getSuperSectorFromSector(sector)).not.toThrow()
    );
  });

  it("provides the correct sectors in super sector", () => {
    Object.values(Sector).forEach((sector) =>
      expect(
        getSectorsInSuperSector(getSuperSectorFromSector(sector))
      ).toContain(sector)
    );
  });

  it("provides exactly one super sector per industry", () => {
    Object.values(Industry).forEach((industry) =>
      expect(() => getSuperSectorFromIndustry(industry)).not.toThrow()
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
