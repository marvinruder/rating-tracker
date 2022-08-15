import { Country } from "./regions/country";
import { getRegionFromCountry, Region } from "./regions/region";
import {
  getSuperRegionFromCountry,
  getSuperRegionFromRegion,
} from "./regions/superregion";

describe("regions", () => {
  it("provides exactly one region per country", () => {
    Object.values(Country).forEach((country) =>
      expect(() => getRegionFromCountry(country as Country)).not.toThrow()
    );
  });
});

describe("super regions", () => {
  it("provides exactly one super region per region", () => {
    Object.values(Region).forEach((region) =>
      expect(() => getSuperRegionFromRegion(region as Region)).not.toThrow()
    );
  });

  it("provides exactly one super region per country", () => {
    Object.values(Country).forEach((country) =>
      expect(() => getSuperRegionFromCountry(country as Country)).not.toThrow()
    );
  });
});

export default {};
