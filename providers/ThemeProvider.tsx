import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as RouterThemeProvider,
} from "expo-router";
import { useColorScheme } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme === "dark" || storedTheme === "light") {
          setColorScheme(storedTheme);
          setIsDarkMode(storedTheme === "dark");
        } else {
          setIsDarkMode(colorScheme === "dark");
        }
      } catch {
        setIsDarkMode(colorScheme === "dark");
      }
    };
    loadTheme();
  }, [colorScheme, setColorScheme]);

  const setTheme = async (theme: "light" | "dark") => {
    setColorScheme(theme);
    setIsDarkMode(theme === "dark");
    try {
      await AsyncStorage.setItem("theme", theme);
    } catch {
      // Keep the in-memory theme even if persistence is unavailable.
    }
  };

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setTheme, toggleTheme }}>
      <RouterThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        {children}
      </RouterThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
