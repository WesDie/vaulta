"use client";
import * as React from "react";
import { useTheme as useNextTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

const ThemeContext = React.createContext<{
  theme: string | undefined;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}>({
  theme: undefined,
  setTheme: () => {},
  toggleTheme: () => {},
});

interface ExtendedThemeProviderProps extends ThemeProviderProps {
  forcedTheme?: "light" | "dark";
}

export function ThemeDataProvider({
  children,
  forcedTheme,
}: ExtendedThemeProviderProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  const toggleTheme = React.useCallback(() => {
    if (!forcedTheme) {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  }, [theme, setTheme, forcedTheme]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use resolvedTheme for better hydration handling
  const currentTheme = forcedTheme || resolvedTheme || theme;

  return (
    <ThemeContext.Provider
      value={{
        theme: isMounted ? currentTheme : undefined,
        setTheme: forcedTheme ? () => {} : setTheme,
        toggleTheme: forcedTheme ? () => {} : toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return React.useContext(ThemeContext);
}

export function useTheme() {
  return useThemeContext();
}
