import { Appearance, ColorSchemeName } from 'react-native';
import { ThemeMode } from '../redux/slices/settingsSlice';

// Light theme colors
export const lightColors = {
  // Primary Colors
  primary: '#2563EB',
  secondary: '#1E3A8A',
  darkBackground: '#0F172A',

  // Alert Colors
  emergencyRed: '#DC2626',
  warningOrange: '#F97316',
  successGreen: '#10B981',
  infoBlue: '#3B82F6',

  // Neutral Colors
  white: '#FFFFFF',
  background: '#F8FAFC',
  lightGrayBg: '#F8FAFC',
  mediumGray: '#94A3B8',
  text: '#0F172A',
  darkText: '#0F172A',
  lightText: '#64748B',
  borderGray: '#E2E8F0',
  border: '#E2E8F0',
  captionText: '#94A3B8',

  // Accent Colors
  badgeRedBg: '#FEE2E2',
  badgeOrangeBg: '#FED7AA',
  badgeGreenBg: '#D1FAE5',
  badgeBlueBg: '#DBEAFE',

  // Status Colors
  online: '#10B981',
  offline: '#94A3B8',
  pending: '#F97316',
  completed: '#10B981',
};

// Dark theme colors - Fully dark authentic dark mode
export const darkColors = {
  // Primary Colors
  primary: '#60A5FA',
  secondary: '#3B82F6',
  darkBackground: '#000000',

  // Alert Colors
  emergencyRed: '#EF4444',
  warningOrange: '#FB923C',
  successGreen: '#34D399',
  infoBlue: '#60A5FA',

  // Neutral Colors - Fully dark
  white: '#1A1A1A', // Dark cards/sections instead of white
  background: '#000000', // Pure black background
  lightGrayBg: '#121212', // Slightly lighter for sections
  mediumGray: '#6B7280',
  text: '#FFFFFF', // Pure white text
  darkText: '#FFFFFF', // Pure white text
  lightText: '#9CA3AF', // Light gray for secondary text
  borderGray: '#1F2937', // Dark borders
  border: '#1F2937', // Dark borders
  captionText: '#9CA3AF',

  // Accent Colors - Darker versions
  badgeRedBg: '#7F1D1D',
  badgeOrangeBg: '#7C2D12',
  badgeGreenBg: '#064E3B',
  badgeBlueBg: '#1E3A8A',

  // Status Colors
  online: '#34D399',
  offline: '#6B7280',
  pending: '#FB923C',
  completed: '#34D399',
};

export type ThemeColors = typeof lightColors;

/**
 * Get the effective theme based on theme mode and system preference
 */
export const getEffectiveTheme = (themeMode: ThemeMode): 'light' | 'dark' => {
  if (themeMode === 'system') {
    const systemTheme = Appearance.getColorScheme();
    return systemTheme === 'dark' ? 'dark' : 'light';
  }
  return themeMode;
};

/**
 * Get theme colors based on theme mode
 */
export const getThemeColors = (themeMode: ThemeMode): ThemeColors => {
  const effectiveTheme = getEffectiveTheme(themeMode);
  return effectiveTheme === 'dark' ? darkColors : lightColors;
};

/**
 * Listen to system theme changes
 */
export const subscribeToThemeChanges = (callback: (colorScheme: ColorSchemeName) => void) => {
  const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    callback(colorScheme);
  });
  return () => subscription.remove();
};

