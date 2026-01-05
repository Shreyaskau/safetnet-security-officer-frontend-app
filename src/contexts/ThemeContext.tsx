import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setTheme, ThemeMode } from '../redux/slices/settingsSlice';
import { getThemeColors, getEffectiveTheme, subscribeToThemeChanges, ThemeColors } from '../utils/theme';

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.settings.theme);
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  // Update system theme when it changes
  useEffect(() => {
    const subscription = subscribeToThemeChanges((colorScheme) => {
      setSystemTheme(colorScheme);
    });
    return subscription;
  }, []);

  // Calculate effective theme
  const effectiveTheme = getEffectiveTheme(themeMode);
  
  // Get theme colors
  const colors = getThemeColors(themeMode);

  // Set theme mode
  const setThemeMode = useCallback((mode: ThemeMode) => {
    dispatch(setTheme(mode));
  }, [dispatch]);

  const value: ThemeContextType = {
    themeMode,
    effectiveTheme,
    colors,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

