import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LogsScreen } from '../screens/main/LogsScreen';
import { colors, typography } from '../utils';

const Tab = createMaterialTopTabNavigator();

export const LogsTabNavigator = ({ navigation }: any) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.lightText,
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 3,
        },
        tabBarLabelStyle: {
          ...typography.secondary,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderGray,
        },
      }}
    >
      <Tab.Screen
        name="Normal"
        options={{
          tabBarLabel: 'NORMAL',
        }}
      >
        {(props) => <LogsScreen {...props} route={{ ...props.route, params: { filter: 'normal' } }} />}
      </Tab.Screen>
      <Tab.Screen
        name="Emergency"
        options={{
          tabBarLabel: 'EMERGENCY',
        }}
      >
        {(props) => <LogsScreen {...props} route={{ ...props.route, params: { filter: 'emergency' } }} />}
      </Tab.Screen>
      <Tab.Screen
        name="Completed"
        options={{
          tabBarLabel: 'COMPLETED',
        }}
      >
        {(props) => <LogsScreen {...props} route={{ ...props.route, params: { filter: 'completed' } }} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

