import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProfileScreen } from './ProfileScreen';
import { BottomTabNavigator } from '../../components/navigation/BottomTabNavigator';
import { colors } from '../../utils';

export const ProfileScreenWithBottomNav = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <ProfileScreen navigation={navigation} />
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

