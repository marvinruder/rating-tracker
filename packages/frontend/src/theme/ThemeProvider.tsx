import type { Theme } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import { SuperRegion, SuperSector } from "@rating-tracker/commons";
import React, { createContext, FC, useEffect, useState } from "react";

import { Light, Dark } from "./scheme";

/**
 * An override to the styles of the MUI theme, allowing us to add our own custom properties.
 */
declare module "@mui/material/styles" {
  interface Theme {
    colors: {
      gradients: {
        blue1: string;
        blue2: string;
        blue3: string;
        blue4: string;
        blue5: string;
        orange1: string;
        orange2: string;
        orange3: string;
        purple1: string;
        purple3: string;
        pink1: string;
        pink2: string;
        green1: string;
        green2: string;
        black1: string;
        black2: string;
      };
      shadows: {
        success: string;
        error: string;
        primary: string;
        warning: string;
        info: string;
      };
      alpha: {
        white: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
        trueWhite: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
        black: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
      };
      secondary: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      primary: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      success: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      warning: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      error: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      info: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      region: Record<SuperRegion, string>;
      /**
       * The colors Morningstar uses for each super sector.
       */
      sector: Record<SuperSector, string>;
      /**
       * A color spectrum from red (0) to green (10) used for the analyst consensus.
       */
      consensus: {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: string;
        9: string;
        10: string;
      };
      /**
       * The colors MSCI uses for ratings and implied temperature rises.
       */
      msci: {
        /**
         * The color used for MSCI ESG Rating leaders (AAA, AA).
         */
        Leader: string;
        /**
         * The color used for MSCI ESG Rating averages (A, BBB, BB).
         */
        Average: string;
        /**
         * The color used for MSCI ESG Rating laggards (B, CCC).
         */
        Laggard: string;
        /**
         * The color used for companies that are aligned with the 1.5°C goal of the Paris Agreement.
         */
        Aligned1: string;
        /**
         * The color used for companies that are aligned with the 2°C goal of the Paris Agreement.
         */
        Aligned2: string;
        /**
         * The color used for companies that are misaligned with the goals of the Paris Agreement.
         */
        Misaligned: string;
        /**
         * The color used for companies that are strongly misaligned with the goals of the Paris Agreement.
         */
        StronglyMisaligned: string;
      };
      /**
       * The colors Sustainalytics uses for each risk level.
       */
      sustainalytics: {
        negligible: string; // Grey
        low: string;
        medium: string;
        high: string;
        severe: string; // Very intense yellow
      };
      /**
       * The colors used for the switch selector.
       */
      switchSelector: {
        selected: string;
        unselected: string;
      };
    };
    general: {
      reactFrameworkColor: React.CSSProperties["color"];
      borderRadiusSm: string;
      borderRadius: string;
      borderRadiusLg: string;
      borderRadiusXl: string;
    };
    sidebar: {
      background: React.CSSProperties["color"];
      boxShadow: React.CSSProperties["color"];
      width: string;
      textColor: React.CSSProperties["color"];
      dividerBg: React.CSSProperties["color"];
      menuItemColor: React.CSSProperties["color"];
      menuItemColorActive: React.CSSProperties["color"];
      menuItemBg: React.CSSProperties["color"];
      menuItemBgActive: React.CSSProperties["color"];
      menuItemIconColor: React.CSSProperties["color"];
      menuItemIconColorActive: React.CSSProperties["color"];
      menuItemHeadingColor: React.CSSProperties["color"];
    };
    header: {
      height: string;
      background: React.CSSProperties["color"];
      boxShadow: React.CSSProperties["color"];
      textColor: React.CSSProperties["color"];
    };
  }

  interface ThemeOptions {
    colors: {
      gradients: {
        blue1: string;
        blue2: string;
        blue3: string;
        blue4: string;
        blue5: string;
        orange1: string;
        orange2: string;
        orange3: string;
        purple1: string;
        purple3: string;
        pink1: string;
        pink2: string;
        green1: string;
        green2: string;
        black1: string;
        black2: string;
      };
      shadows: {
        success: string;
        error: string;
        primary: string;
        warning: string;
        info: string;
      };
      alpha: {
        white: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
        trueWhite: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
        black: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
      };
      secondary: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      primary: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      success: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      warning: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      error: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      info: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      region: Record<SuperRegion, string>;
      /**
       * The colors Morningstar uses for each super sector.
       */
      sector: Record<SuperSector, string>;
      /**
       * A color spectrum from red (0) to green (10) used for the analyst consensus.
       */
      consensus: {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: string;
        9: string;
        10: string;
      };
      /**
       * The colors MSCI uses for ratings and implied temperature rises.
       */
      msci: {
        /**
         * The color used for MSCI ESG Rating leaders (AAA, AA).
         */
        Leader: string;
        /**
         * The color used for MSCI ESG Rating averages (A, BBB, BB).
         */
        Average: string;
        /**
         * The color used for MSCI ESG Rating laggards (B, CCC).
         */
        Laggard: string;
        /**
         * The color used for companies that are aligned with the 1.5°C goal of the Paris Agreement.
         */
        Aligned1: string;
        /**
         * The color used for companies that are aligned with the 2°C goal of the Paris Agreement.
         */
        Aligned2: string;
        /**
         * The color used for companies that are misaligned with the goals of the Paris Agreement.
         */
        Misaligned: string;
        /**
         * The color used for companies that are strongly misaligned with the goals of the Paris Agreement.
         */
        StronglyMisaligned: string;
      };
      /**
       * The colors Sustainalytics uses for each risk level.
       */
      sustainalytics: {
        negligible: string; // Grey
        low: string;
        medium: string;
        high: string;
        severe: string; // Very intense yellow
      };
      /**
       * The colors used for the switch selector.
       */
      switchSelector: {
        selected: string;
        unselected: string;
      };
    };

    general: {
      reactFrameworkColor: React.CSSProperties["color"];
      borderRadiusSm: string;
      borderRadius: string;
      borderRadiusLg: string;
      borderRadiusXl: string;
    };
    sidebar: {
      background: React.CSSProperties["color"];
      boxShadow: React.CSSProperties["color"];
      width: string;
      textColor: React.CSSProperties["color"];
      dividerBg: React.CSSProperties["color"];
      menuItemColor: React.CSSProperties["color"];
      menuItemColorActive: React.CSSProperties["color"];
      menuItemBg: React.CSSProperties["color"];
      menuItemBgActive: React.CSSProperties["color"];
      menuItemIconColor: React.CSSProperties["color"];
      menuItemIconColorActive: React.CSSProperties["color"];
      menuItemHeadingColor: React.CSSProperties["color"];
    };
    header: {
      height: string;
      background: React.CSSProperties["color"];
      boxShadow: React.CSSProperties["color"];
      textColor: React.CSSProperties["color"];
    };
  }
}

/**
 * An object provided by the theme context.
 */
type ThemeContextType = (themeName: "dark" | "light") => void;

/**
 * A context providing a theme for the application.
 */
export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

/**
 * A wrapped theme provider.
 *
 * @param {ThemeProviderWrapperProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const ThemeProviderWrapper: FC<ThemeProviderWrapperProps> = (props: ThemeProviderWrapperProps): JSX.Element => {
  const [themeName, setThemeName] = useState<"dark" | "light">(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  let theme: Theme;
  switch (themeName) {
    case "dark":
      theme = Dark;
      break;
    case "light":
      theme = Light;
      break;
  }

  useEffect(() => {
    // Add listener to update styles
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => setThemeName(e.matches ? "dark" : "light"));

    // Setup dark/light mode for the first time
    setThemeName(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    // Remove listener
    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", () => {});
    };
  }, []);

  return (
    <ThemeContext.Provider value={setThemeName}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Properties for the theme provider wrapper.
 */
type ThemeProviderWrapperProps = {
  children: React.ReactNode;
};

export default ThemeProviderWrapper;
