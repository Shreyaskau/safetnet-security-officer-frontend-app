import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LogsScreen } from './LogsScreen';
import { BottomTabNavigator } from '../../components/navigation/BottomTabNavigator';
import { colors } from '../../utils';

export const LogsScreenWithBottomNav = ({ navigation, route }: any) => {
  return (
    <View style={styles.container}>
      <LogsScreen navigation={navigation} route={route} />
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

