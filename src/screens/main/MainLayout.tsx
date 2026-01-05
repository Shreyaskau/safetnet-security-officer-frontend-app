import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomTabNavigator } from '../../components/navigation/BottomTabNavigator';
import { useTheme } from '../../contexts/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showBottomNav = true,
}) => {
  const { colors: themeColors } = useTheme();
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {children}
      {showBottomNav && <BottomTabNavigator />}
    </View>
  );
};












