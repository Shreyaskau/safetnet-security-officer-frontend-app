import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing } from '../../utils';
import { useTheme } from '../../contexts/ThemeContext';

interface TabItem {
  name: string;
  label: string;
  icon: string;
  activeIcon?: string;
}

const tabs: TabItem[] = [
  { name: 'Dashboard', label: 'Home', icon: 'dashboard', activeIcon: 'dashboard' },
  { name: 'Alerts', label: 'Alerts', icon: 'notifications-none', activeIcon: 'notifications' },
  { name: 'GeofenceArea', label: 'Map', icon: 'map', activeIcon: 'map' },
  { name: 'Profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export const BottomTabNavigator = () => {
  const { colors: themeColors, effectiveTheme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const getActiveRouteName = () => {
    const state = navigation.getState();
    if (!state || !state.routes) return '';
    
    const route = state.routes[state.index];
    if (!route) return '';
    
    // Check if route has nested state
    if (route.state) {
      const nestedState = route.state;
      if (nestedState.routes && nestedState.index !== undefined && nestedState.routes[nestedState.index]) {
        return nestedState.routes[nestedState.index].name;
      }
    }
    return route.name || '';
  };

  const activeRoute = getActiveRouteName();

  const handleTabPress = (tabName: string) => {
    try {
      if (tabName === 'Dashboard') {
        navigation.navigate('Home' as never);
      } else if (tabName === 'Alerts') {
        navigation.navigate('Alerts' as never);
      } else if (tabName === 'GeofenceArea') {
        navigation.navigate('GeofenceArea' as never);
      } else if (tabName === 'Profile') {
        navigation.navigate('Profile' as never);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Dynamic styles based on theme - Only pure black or white, no gray
  const isDark = effectiveTheme === 'dark';
  const backgroundColor = isDark ? '#000000' : '#FFFFFF'; // Pure black in dark, white in light
  const activeColor = isDark ? '#FFFFFF' : '#000000'; // White in dark, black in light
  const inactiveColor = isDark ? '#FFFFFF' : '#000000'; // White in dark, black in light (same color, different opacity)
  const borderColor = isDark ? '#000000' : '#FFFFFF'; // Black border in dark, white border in light

  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: backgroundColor,
      borderTopWidth: 1,
      borderTopColor: borderColor,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      justifyContent: 'space-around',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
    },
    label: {
      ...typography.caption,
      color: inactiveColor,
      fontSize: 12,
      opacity: 0.5, // 50% opacity for inactive text
    },
    activeLabel: {
      color: activeColor,
      fontWeight: '600',
      opacity: 1, // Fully opaque for active text
    },
    activeIndicator: {
      position: 'absolute',
      bottom: -spacing.sm,
      left: '50%',
      marginLeft: -20,
      width: 40,
      height: 3,
      backgroundColor: activeColor,
      borderRadius: 2,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {tabs.map((tab) => {
        // Check if this tab is active
        const isActive = 
          activeRoute === tab.name || 
          (tab.name === 'Dashboard' && activeRoute === 'Home') ||
          (tab.name === 'Alerts' && activeRoute === 'Alerts') ||
          (tab.name === 'GeofenceArea' && activeRoute === 'GeofenceArea') ||
          (tab.name === 'Profile' && activeRoute === 'Profile');
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handleTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <Icon
              name={(isActive && tab.activeIcon) ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? activeColor : inactiveColor}
              style={[styles.icon, { opacity: isActive ? 1 : 0.5 }]}
            />
            <Text style={[dynamicStyles.label, isActive && dynamicStyles.activeLabel]}>
              {tab.label}
            </Text>
            {isActive && <View style={dynamicStyles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  icon: {
    marginBottom: spacing.xs,
  },
});

