import React, { createContext, useState, useContext, useEffect } from "react";
import { localStore } from "../localStore/LocalStore";

export const ThemeContext = createContext();

// Shadcn-like Color Palette (Zinc Variant)
export const themes = {
  dark: {
    name: "dark",
    // Base Layout
    background: "#09090b", // Zinc 950 (Deep Black/Background)
    primary: "#18181b", // Zinc 900 (Card Background/Surface)

    // Text & Content
    text: "#fafafa", // Zinc 50 (Main Text)
    heading: "#ffffff", // Pure White
    secondary: "#a1a1aa", // Zinc 400 (Muted Text)

    // Actions & Borders
    border: "#27272a", // Zinc 800 (Subtle Borders)
    textSecondary: "#fafafa", // Zinc 50 (Primary Button Background - Inverted)
    shareButtonColor: "#27272a", // Zinc 800 (Secondary Button)

    // Status / Functional
    deliveryDate: "#4ade80", // Green-400 (Success/Info)
    logOutBackground: "#ef4444", // Red-500 (Destructive)
    error: "#ef4444",
    success: "#22c55e",

    // Fallbacks/Extras
    cardBackground: "#18181b",
  },
  light: {
    name: "light",
    // Base Layout
    background: "#ffffff", // Pure White
    primary: "#ffffff", // White (Card Background)

    // Text & Content
    text: "#09090b", // Zinc 950 (Main Text)
    heading: "#09090b", // Zinc 900
    secondary: "#09090b", // Zinc 500 (Muted Text)

    // Actions & Borders
    border: "#e4e4e7", // Zinc 200 (Borders)
    textSecondary: "#18181b", // Zinc 900 (Primary Button Background)
    shareButtonColor: "#f4f4f5", // Zinc 100 (Secondary Button)

    // Status / Functional
    deliveryDate: "#16a34a", // Green-600
    logOutBackground: "#dc2626", // Red-600
    error: "#dc2626",
    success: "#16a34a",

    // Fallbacks/Extras
    cardBackground: "#ffffff",
  },
};

export const ThemeProvider = ({ children, initialTheme }) => {
  // Set default state to "dark"
  const [currentTheme, setCurrentTheme] = useState(initialTheme || "dark");

  const toggleTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStore?.setTheme(themeName);
  };

  useEffect(() => {
    if (!initialTheme) {
      (async () => {
        const storedTheme = await localStore?.getCurrentTheme("theme");
        if (storedTheme && themes[storedTheme]) {
          setCurrentTheme(storedTheme);
        } else {
          // If no stored theme, ensure we default to dark
          setCurrentTheme("dark");
        }
      })();
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: themes[currentTheme],
        currentTheme: currentTheme,
        toggleTheme,
        themes: themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
