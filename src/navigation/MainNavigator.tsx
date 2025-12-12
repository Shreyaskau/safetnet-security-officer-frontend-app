import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AlertsScreenWithBottomNav } from '../screens/main/AlertsScreenWithBottomNav';
import { ProfileScreenWithBottomNav } from '../screens/main/ProfileScreenWithBottomNav';
import { GeofenceMapScreen } from '../screens/main/GeofenceMapScreen';
import { GeofenceMapScreenWithBottomNav } from '../screens/main/GeofenceMapScreenWithBottomNav';
import { BroadcastScreen } from '../screens/main/BroadcastScreen';
import { AlertResponseScreen } from '../screens/main/AlertResponseScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { PrivacyScreen } from '../screens/settings/PrivacyScreen';
import { BottomTabNavigator } from '../components/navigation/BottomTabNavigator';
import { SearchScreen } from '../screens/common/SearchScreen';
import { OfflineScreen } from '../screens/common/OfflineScreen';
import { DashboardScreenWithBottomNav } from '../screens/main/DashboardScreen';
import SOSPage from '../components/common/SOSPage';
import { APITestScreen } from '../screens/test/APITestScreen';
import LeafletMapScreen from '../screens/LeafletMapScreen';

const Stack = createNativeStackNavigator();

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={DashboardScreenWithBottomNav}
      />
      <Stack.Screen
        name="Alerts"
        component={AlertsScreenWithBottomNav}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreenWithBottomNav}
      />
      <Stack.Screen
        name="GeofenceArea"
        component={GeofenceMapScreenWithBottomNav}
      />
      <Stack.Screen
        name="Broadcast"
        component={BroadcastScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
      />
      <Stack.Screen
        name="AlertResponse"
        component={AlertResponseScreen}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
      />
      <Stack.Screen
        name="Offline"
        component={OfflineScreen}
      />
      <Stack.Screen
        name="SOS"
        component={SOSPage}
      />
      <Stack.Screen
        name="APITest"
        component={APITestScreen}
      />
      <Stack.Screen
        name="LeafletMap"
        component={LeafletMapScreen}
      />
    </Stack.Navigator>
  );
};

