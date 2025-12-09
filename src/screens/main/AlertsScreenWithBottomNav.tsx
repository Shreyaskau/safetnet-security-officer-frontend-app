import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertsScreen } from './AlertsScreen';
import { BottomTabNavigator } from '../../components/navigation/BottomTabNavigator';
import { colors } from '../../utils';

export const AlertsScreenWithBottomNav = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <AlertsScreen navigation={navigation} />
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

