import { Country, emojiFlag, getCountryCode } from "./regions/country";
import {
  getCountriesInRegion,
  getRegionFromCountry,
  Region,
} from "./regions/region";
import {
  getRegionsInSuperRegions,
  getSuperRegionFromCountry,
  getSuperRegionFromRegion,
} from "./regions/superregion";
import { describe, it, expect } from "vitest";

describe("countries", () => {
  it("provides correct country codes", () => {
    expect(getCountryCode("Germany" as Country)).toBe("DE");
    expect(getCountryCode(Country.US)).toBe("US");
    expect(getCountryCode(Country.GB)).toBe("GB");
    expect(getCountryCode(Country.FR)).toBe("FR");
    expect(getCountryCode(Country.TW)).toBe("TW");
  });

  it("provides correct emojis", () => {
    expect(emojiFlag("Germany" as Country)).toBe("🇩🇪");
    expect(emojiFlag(Country.US)).toBe("🇺🇸");
    expect(emojiFlag(Country.GB)).toBe("🇬🇧");
    expect(emojiFlag(Country.FR)).toBe("🇫🇷");
    expect(emojiFlag(Country.TW)).toBe("🇹🇼");
  });
});

describe("regions", () => {
  it("provides exactly one region per country", () => {
    Object.values(Country).forEach((country) =>
      expect(() => getRegionFromCountry(country)).not.toThrow()
    );
  });

  it("provides the correct countries in region", () => {
    Object.values(Country).forEach((country) =>
      expect(getCountriesInRegion(getRegionFromCountry(country))).toContain(
        country
      )
    );
  });
});

describe("super regions", () => {
  it("provides exactly one super region per region", () => {
    Object.values(Region).forEach((region) =>
      expect(() => getSuperRegionFromRegion(region)).not.toThrow()
    );
  });

  it("provides the correct regions in super region", () => {
    Object.values(Region).forEach((region) =>
      expect(
        getRegionsInSuperRegions(getSuperRegionFromRegion(region))
      ).toContain(region)
    );
  });

  it("provides exactly one super region per country", () => {
    Object.values(Country).forEach((country) =>
      expect(() => getSuperRegionFromCountry(country)).not.toThrow()
    );
  });
});

export default {};
