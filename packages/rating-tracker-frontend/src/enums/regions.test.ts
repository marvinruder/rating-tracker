import { Country, emojiFlag, getCountryCode } from "./regions/country";
import { getRegionFromCountry, Region } from "./regions/region";
import {
  getSuperRegionFromCountry,
  getSuperRegionFromRegion,
} from "./regions/superregion";

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
