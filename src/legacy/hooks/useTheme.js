import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useLocalStorageTheme();

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const resetTheme = () => {
    setTheme("light");
  };

  return { theme, toggleTheme, resetTheme };
}

function useLocalStorageTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("financeflow_theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("financeflow_theme", theme);
    } catch (error) {
      console.error("Could not save theme:", error);
    }
  }, [theme]);

  return [theme, setTheme];
}
