import { createContext, FC, useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material";
import { themeCreator } from "./base";

/**
 * An object provided by the theme context.
 */
type ThemeContextType = (themeName: string) => void;

/**
 * A context providing a theme for the application.
 */
export const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType
);

/**
 * A wrapped theme provider.
 *
 * @param {ThemeProviderWrapperProps} props The properties of the component.
 * @returns {JSX.Element} The component.
 */
const ThemeProviderWrapper: FC<ThemeProviderWrapperProps> = (
  props: ThemeProviderWrapperProps
) => {
  const curThemeName = localStorage.getItem("appTheme") || "NebulaFighterTheme";
  const [themeName, _setThemeName] = useState(curThemeName);
  const theme = themeCreator(themeName);

  /**
   * Sets the theme name.
   *
   * @param {string} themeName The name of the theme.
   */
  const setThemeName = (themeName: string): void => {
    localStorage.setItem("appTheme", themeName);
    _setThemeName(themeName);
  };

  useEffect(() => {
    // Add listener to update styles
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) =>
        setThemeName(e.matches ? "NebulaFighterTheme" : "PureLightTheme")
      );

    // Setup dark/light mode for the first time
    setThemeName(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "NebulaFighterTheme"
        : "PureLightTheme"
    );

    // Remove listener
    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", () => {});
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
