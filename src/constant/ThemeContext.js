// constant/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { colors } from "./Colors";
import { localStore } from "../localStore/LocalStore";

export const ThemeContext = createContext();

// Define multiple themes
export const themes = {
  light: {
    name: "light",
    background: colors.THEME_BACKGROUND,
    primary: colors.CARD_BACKGROUND,
    secondary: "#FF6B35",
    text: colors.TEXT_COLOR,
    heading: colors.HEADING_COLOR,
    deliveryDate: "#5e9c48",
    shareButtonColor: "#3A3A3C",
    textSecondary: colors.PRIMARY_BUTTON_BACKGROUND,
    logOutBackground: "#f44336",
    cardBackground: "#FFFFFF",
    border: colors.CARD_BORDER,
    error: "#D32F2F",
    success: "#388E3C",
  },
  dark: {
    name: "dark",
    background: "#0c1836",
    primary: "#18284d",
    secondary: "#FF8A65",
    text: "#FFFFFF",
    heading: colors.HEADING_COLOR,
    logOutBackground: "#f44336",
    deliveryDate: "#5e9c48",
    shareButtonColor: "#3A3A3C",
    textSecondary: "#517fed",
    cardBackground: "#1E1E1E",
    border: "#424d66",
    error: "#F44336",
    success: "#66BB6A",
  },
};

export const ThemeProvider = ({ children, initialTheme }) => {
  const [currentTheme, setCurrentTheme] = useState(initialTheme || "light");

  const toggleTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStore?.setTheme(themeName);
  };
  useEffect(() => {
    if (!initialTheme) {
      (async () => {
        const storedTheme = await localStore.getCurrentTheme("theme");
        if (storedTheme && themes[storedTheme]) {
          setCurrentTheme(storedTheme);
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
