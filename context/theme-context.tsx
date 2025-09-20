"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type ResolvedTheme = "dark" | "light";
type StoredTheme = Theme | "system";

type ThemeContextType = {
  theme: Theme | "system"; // current selection
  resolvedTheme: ResolvedTheme; // what's actually applied
  setTheme: (theme: Theme) => void;
  resetToSystem: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  storageKey = "theme",
}: {
  children: React.ReactNode;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<StoredTheme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(storageKey) as StoredTheme) || "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const systemDark = media.matches;
      const final =
        theme === "system" ? (systemDark ? "dark" : "light") : theme;

      root.classList.remove("dark", "light");
      root.classList.add(final === "dark" ? "dark" : "light");
      setResolvedTheme(final);
    };

    apply();

    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const resetToSystem = () => {
    localStorage.removeItem(storageKey);
    setThemeState("system");
  };

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, resetToSystem }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
