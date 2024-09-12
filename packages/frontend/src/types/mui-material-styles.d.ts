import type { AnalystRating, SuperRegion, SuperSector } from "@rating-tracker/commons";

/**
 * Colors related to attributes within Rating Tracker.
 */
interface RatingTrackerColors {
  /**
   * The colors Morningstar uses for each super region.
   */
  region: Record<SuperRegion, React.CSSProperties["color"]>;
  /**
   * The colors Morningstar uses for each super sector.
   */
  sector: Record<SuperSector, React.CSSProperties["color"]>;
  /**
   * A color spectrum from red (Sell) to green (Buy) used for the analyst ratings.
   */
  consensus: Record<AnalystRating, React.CSSProperties["color"]>;
  /**
   * The colors MSCI uses for ratings and implied temperature rises.
   */
  msci: {
    /**
     * The color used for MSCI ESG Rating leaders (AAA, AA).
     */
    Leader: React.CSSProperties["color"];
    /**
     * The color used for MSCI ESG Rating averages (A, BBB, BB).
     */
    Average: React.CSSProperties["color"];
    /**
     * The color used for MSCI ESG Rating laggards (B, CCC).
     */
    Laggard: React.CSSProperties["color"];
    /**
     * The color used for companies that are aligned with the 1.5°C goal of the Paris Agreement.
     */
    Aligned1: React.CSSProperties["color"];
    /**
     * The color used for companies that are aligned with the 2°C goal of the Paris Agreement.
     */
    Aligned2: React.CSSProperties["color"];
    /**
     * The color used for companies that are misaligned with the goals of the Paris Agreement.
     */
    Misaligned: React.CSSProperties["color"];
    /**
     * The color used for companies that are strongly misaligned with the goals of the Paris Agreement.
     */
    StronglyMisaligned: React.CSSProperties["color"];
  };
  /**
   * The colors Sustainalytics uses for each risk level.
   */
  sustainalytics: {
    negligible: React.CSSProperties["color"]; // Grey
    low: React.CSSProperties["color"];
    medium: React.CSSProperties["color"];
    high: React.CSSProperties["color"];
    severe: React.CSSProperties["color"]; // Very intense yellow
  };
  /**
   * The colors used for the switch selector.
   */
  switchSelector: {
    selected: React.CSSProperties["color"];
    unselected: React.CSSProperties["color"];
  };
  /**
   * The colors used for a graph line indicating a trend.
   */
  trend: {
    up: React.CSSProperties["color"];
    down: React.CSSProperties["color"];
  };
}

/**
 * An override to the styles of the MUI theme, allowing us to add our own custom properties.
 */
declare module "@mui/material/styles" {
  interface Palette extends RatingTrackerColors {
    white: Palette["primary"];
    trueWhite: Palette["primary"];
    black: Palette["primary"];
    trueBlack: Palette["primary"];
    sidebar: { boxShadow: string };
    header: { background: NonNullable<React.CSSProperties["color"]> };
  }

  interface PaletteOptions extends Partial<RatingTrackerColors> {
    white?: PaletteOptions["primary"];
    trueWhite?: PaletteOptions["primary"];
    black?: PaletteOptions["primary"];
    trueBlack?: PaletteOptions["primary"];
    sidebar?: { boxShadow: string };
    header?: { background: NonNullable<React.CSSProperties["color"]> };
  }

  interface PaletteColor {
    lighter: React.CSSProperties["color"];
    alpha5: React.CSSProperties["color"];
    alpha10: React.CSSProperties["color"];
    alpha30: React.CSSProperties["color"];
    alpha50: React.CSSProperties["color"];
    alpha70: React.CSSProperties["color"];
    shadow?: string;
  }

  interface SimplePaletteColorOptions {
    lighter: React.CSSProperties["color"];
    alpha5: React.CSSProperties["color"];
    alpha10: React.CSSProperties["color"];
    alpha30: React.CSSProperties["color"];
    alpha50: React.CSSProperties["color"];
    alpha70: React.CSSProperties["color"];
    shadow?: string;
  }

  interface Theme {
    sidebar: {
      width: string;
    };
  }

  interface ThemeOptions {
    sidebar: {
      width: string;
    };
  }
}
