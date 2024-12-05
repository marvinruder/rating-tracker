import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * An object provided by the color scheme context.
 */
type ColorSchemeContextType = {
  /**
   * The preferred color scheme of the user.
   */
  mode: "light" | "dark" | undefined;
};

const initialMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : undefined;

/**
 * A context providing a state for the color scheme of the application.
 */
const ColorSchemeContext = createContext<ColorSchemeContextType>({ mode: initialMode });

/**
 * A provider for the color scheme context.
 * @param props The properties of the component.
 * @returns The component.
 */
export const ColorSchemeProvider = (props: React.PropsWithChildren): React.JSX.Element => {
  const [preferredColorScheme, setPreferredColorScheme] = useState<ColorSchemeContextType["mode"]>(initialMode);

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)");
    const isLight = window.matchMedia("(prefers-color-scheme: light)");

    const darkListener = ({ matches }: MediaQueryListEvent) => matches && setPreferredColorScheme("dark");
    const lightListener = ({ matches }: MediaQueryListEvent) => matches && setPreferredColorScheme("light");

    isDark.addEventListener("change", darkListener);
    isLight.addEventListener("change", lightListener);

    return () => {
      isDark.removeEventListener("change", darkListener);
      isLight.removeEventListener("change", lightListener);
    };
  }, []);

  const contextValue = useMemo(() => ({ mode: preferredColorScheme }), [preferredColorScheme]);

  return <ColorSchemeContext.Provider value={contextValue} {...props} />;
};

/**
 * Hook to use the color scheme context’s state.
 * @returns The color scheme context’s state.
 */
export const useColorScheme = (): ColorSchemeContextType => {
  return useContext(ColorSchemeContext);
};
