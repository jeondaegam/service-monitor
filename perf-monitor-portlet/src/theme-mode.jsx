import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeModeContext = createContext(null);

const STORAGE_KEY = "service-monitor-theme-mode";

function getInitialThemeMode() {
  if (typeof window === "undefined") return "dark";

  return window.localStorage.getItem(STORAGE_KEY) || "dark";
}

export function ThemeModeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, themeMode);
  }, [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      isDark: themeMode === "dark",
      toggleThemeMode: () =>
        setThemeMode((current) => (current === "dark" ? "light" : "dark")),
    }),
    [themeMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return context;
}
