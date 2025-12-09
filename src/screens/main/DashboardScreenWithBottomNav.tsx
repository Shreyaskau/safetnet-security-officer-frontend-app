import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DashboardScreen } from './DashboardScreen';
import { BottomTabNavigator } from '../../components/navigation/BottomTabNavigator';
import { colors } from '../../utils';

export const DashboardScreenWithBottomNav = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <DashboardScreen navigation={navigation} />
      <BottomTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
});












