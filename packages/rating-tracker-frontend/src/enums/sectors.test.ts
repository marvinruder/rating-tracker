import { Industry } from "./sectors/industry";
import { getGroupFromIndustry, IndustryGroup } from "./sectors/industryGroup";
import {
  getSectorFromIndustry,
  getSectorFromIndustryGroup,
  Sector,
} from "./sectors/sector";
import {
  getSuperSectorFromIndustry,
  getSuperSectorFromSector,
} from "./sectors/superSector";

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
});

export default {};
