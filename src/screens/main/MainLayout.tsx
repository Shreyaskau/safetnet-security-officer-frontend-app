import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomTabNavigator } from '../../components/navigation/BottomTabNavigator';
import { colors } from '../../utils';

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showBottomNav = true,
}) => {
  return (
    <View style={styles.container}>
      {children}
      {showBottomNav && <BottomTabNavigator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
});












