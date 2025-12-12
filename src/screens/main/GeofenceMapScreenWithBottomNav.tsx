import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GeofenceMapScreen } from './GeofenceMapScreen';
import { BottomTabNavigator } from '../../components/navigation/BottomTabNavigator';
import { colors } from '../../utils';

export const GeofenceMapScreenWithBottomNav = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <GeofenceMapScreen navigation={navigation} />
      <BottomTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

