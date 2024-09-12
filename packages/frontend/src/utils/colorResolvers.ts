import type { Stock } from "@rating-tracker/commons";

/**
 * Resolves the color index of the MSCI ESG Rating of a stock.
 * @param stock The stock to resolve the color index for.
 * @returns The color index.
 */
export const getMSCIESGRatingColorIndex = (stock: Pick<Stock, "msciESGRating">): "Leader" | "Average" | "Laggard" =>
  ["AAA", "AA"].includes(stock.msciESGRating!)
    ? "Leader"
    : ["B", "CCC"].includes(stock.msciESGRating!)
      ? "Laggard"
      : "Average";

/**
 * Resolves the color index of the MSCI Implied Temperature Rise of a stock.
 * @param stock The stock to resolve the color index for.
 * @returns The color index.
 */
export const getMSCITemperatureColorIndex = (
  stock: Pick<Stock, "msciTemperature">,
): "Aligned1" | "Aligned2" | "Misaligned" | "StronglyMisaligned" =>
  stock.msciTemperature! <= 1.5
    ? "Aligned1"
    : stock.msciTemperature! <= 2.0
      ? "Aligned2"
      : stock.msciTemperature! <= 3.2
        ? "Misaligned"
        : "StronglyMisaligned";

/**
 * Resolves the color index of the Sustainalytics ESG Risk of a stock.
 * @param stock The stock to resolve the color index for.
 * @returns The color index.
 */
export const getSustainalyticsESGRiskColorIndex = (
  stock: Pick<Stock, "sustainalyticsESGRisk">,
): "negligible" | "low" | "medium" | "high" | "severe" =>
  stock.sustainalyticsESGRisk! < 10
    ? "negligible"
    : stock.sustainalyticsESGRisk! < 20
      ? "low"
      : stock.sustainalyticsESGRisk! < 30
        ? "medium"
        : stock.sustainalyticsESGRisk! < 40
          ? "high"
          : "severe";
