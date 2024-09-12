import { describe, expect, it } from "vitest";

import {
  getMSCIESGRatingColorIndex,
  getMSCITemperatureColorIndex,
  getSustainalyticsESGRiskColorIndex,
} from "./colorResolvers";

describe.concurrent("MSCI ESG Rating color resolver", () => {
  it("resolves the color index for a Leader stock", () => {
    expect(getMSCIESGRatingColorIndex({ msciESGRating: "AAA" })).toBe("Leader");
    expect(getMSCIESGRatingColorIndex({ msciESGRating: "AA" })).toBe("Leader");
  });

  it("resolves the color index for an Average stock", () => {
    expect(getMSCIESGRatingColorIndex({ msciESGRating: "A" })).toBe("Average");
    expect(getMSCIESGRatingColorIndex({ msciESGRating: "BBB" })).toBe("Average");
    expect(getMSCIESGRatingColorIndex({ msciESGRating: "BB" })).toBe("Average");
  });

  it("resolves the color index for a Laggard stock", () => {
    expect(getMSCIESGRatingColorIndex({ msciESGRating: "B" })).toBe("Laggard");
    expect(getMSCIESGRatingColorIndex({ msciESGRating: "CCC" })).toBe("Laggard");
  });
});

describe.concurrent("MSCI Implied Temperature Rise color resolver", () => {
  it("resolves the color index for a stock aligned with the 1.5 degrees target", () => {
    expect(getMSCITemperatureColorIndex({ msciTemperature: 1.3 })).toBe("Aligned1");
    expect(getMSCITemperatureColorIndex({ msciTemperature: 1.5 })).toBe("Aligned1");
  });

  it("resolves the color index for a stock aligned with the 2.0 degrees target", () => {
    expect(getMSCITemperatureColorIndex({ msciTemperature: 1.6 })).toBe("Aligned2");
    expect(getMSCITemperatureColorIndex({ msciTemperature: 2.0 })).toBe("Aligned2");
  });

  it("resolves the color index for a misaligned stock", () => {
    expect(getMSCITemperatureColorIndex({ msciTemperature: 2.1 })).toBe("Misaligned");
    expect(getMSCITemperatureColorIndex({ msciTemperature: 3.2 })).toBe("Misaligned");
  });

  it("resolves the color index for a strongly misaligned stock", () => {
    expect(getMSCITemperatureColorIndex({ msciTemperature: 3.3 })).toBe("StronglyMisaligned");
    expect(getMSCITemperatureColorIndex({ msciTemperature: 4.0 })).toBe("StronglyMisaligned");
  });
});

describe.concurrent("Sustainalytics ESG Risk color resolver", () => {
  it("resolves the color index for a negligible ESG risk stock", () => {
    expect(getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk: 0 })).toBe("negligible");
    expect(getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk: 9.9 })).toBe("negligible");
  });

  it("resolves the color index for a low ESG risk stock", () => {
    expect(getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk: 10 })).toBe("low");
    expect(getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk: 19.9 })).toBe("low");
  });

  it("resolves the color index for a medium ESG risk stock", () => {
    expect(getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk: 20 })).toBe("medium");
    expect(getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk: 29.9 })).toBe("medium");
  });

  it("resolves the color index for a high ESG risk stock", () => {
    expect(getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk: 30 })).toBe("high");
    expect(getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk: 39.9 })).toBe("high");
  });

  it("resolves the color index for a severe ESG risk stock", () => {
    expect(getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk: 40 })).toBe("severe");
    expect(getSustainalyticsESGRiskColorIndex({ sustainalyticsESGRisk: 59.9 })).toBe("severe");
  });
});
