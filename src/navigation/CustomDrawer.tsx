import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppSelector } from '../redux/hooks';
import { colors } from '../utils';

export const CustomDrawer = (props: DrawerContentComponentProps) => {
  const officer = useAppSelector((state) => state.auth.officer);
  const unreadCount = useAppSelector((state) => state.alerts.unreadCount);

  const menuItems = [
    {
      name: 'Home',
      label: 'Home',
      icon: 'dashboard',
      activeIcon: 'dashboard',
      badge: unreadCount > 0 ? unreadCount : undefined,
      onPress: () => {
        // Close drawer first, then navigate
        props.navigation.closeDrawer();
        // Small delay to ensure drawer closes smoothly
        setTimeout(() => {
          props.navigation.navigate('Home');
        }, 100);
      },
    },
    {
      name: 'Profile',
      label: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
      onPress: () => {
        props.navigation.navigate('Profile');
        props.navigation.closeDrawer();
      },
    },
    {
      name: 'Alerts',
      label: 'Alerts',
      icon: 'notifications-none',
      activeIcon: 'notifications',
      onPress: () => {
        props.navigation.navigate('Alerts');
        props.navigation.closeDrawer();
      },
    },
    {
      name: 'GeofenceArea',
      label: 'Geofence Area',
      icon: 'map',
      activeIcon: 'map',
      onPress: () => {
        props.navigation.navigate('GeofenceArea');
        props.navigation.closeDrawer();
      },
    },
    {
      name: 'Broadcast',
      label: 'Send Alert',
      icon: 'send',
      activeIcon: 'send',
      onPress: () => {
        props.navigation.navigate('Broadcast');
        props.navigation.closeDrawer();
      },
    },
  ];

  const secondaryItems = [
    {
      name: 'Statistics',
      label: 'Statistics',
      icon: 'bar-chart',
      activeIcon: 'bar-chart',
      badge: 'New',
      badgeColor: colors.successGreen,
      onPress: () => {},
    },
    {
      name: 'ShareApp',
      label: 'Share App',
      icon: 'share',
      activeIcon: 'share',
      onPress: () => {},
    },
    {
      name: 'Settings',
      label: 'Settings',
      icon: 'settings',
      activeIcon: 'settings',
      onPress: () => {
        props.navigation.navigate('SettingsStack');
        props.navigation.closeDrawer();
      },
    },
    {
      name: 'Help',
      label: 'Help & Support',
      icon: 'help-outline',
      activeIcon: 'help',
      onPress: () => {},
    },
  ];

  // Get active route - handle nested navigators
  const getActiveRoute = () => {
    const state = props.state;
    const route = state.routes[state.index];
    // If the route has nested state, get the nested route name
    if (route.state) {
      const nestedState = route.state;
      if (nestedState.index !== undefined) {
        const nestedRoute = nestedState.routes[nestedState.index];
        return nestedRoute.name;
      }
    }
    return route.name;
  };
  
  const activeRoute = getActiveRoute();

  const handleCloseDrawer = () => {
    try {
      // Try multiple methods to ensure drawer closes
      if (props.navigation.closeDrawer) {
        props.navigation.closeDrawer();
      } else {
        props.navigation.dispatch(DrawerActions.closeDrawer());
      }
    } catch (error) {
      console.error('Error closing drawer:', error);
      // Fallback
      props.navigation.dispatch(DrawerActions.closeDrawer());
    }
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Header Section with Close Button */}
        <View style={styles.headerSection}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseDrawer}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={20} color={colors.darkText} />
          </TouchableOpacity>
          <View style={styles.profileImageContainer}>
            {officer && officer.user_image ? (
              <Image
                source={{ uri: officer.user_image }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={styles.profileImageText}>
                  {officer && officer.name && typeof officer.name === 'string' ? officer.name.charAt(0).toUpperCase() : 'O'}
                </Text>
              </View>
            )}
            <View style={styles.onlineIndicator} />
          </View>
          <Text style={styles.officerName}>{officer && officer.name ? officer.name : 'Officer'}</Text>
          <Text style={styles.officerRole}>
            {officer && officer.security_role ? officer.security_role : 'Security Officer'}
          </Text>
          <Text style={styles.badgeNumber}>#{officer && officer.security_id ? officer.security_id : 'N/A'}</Text>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => {
            const isActive = activeRoute === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Icon
                  name={(isActive && item.activeIcon) ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? colors.primary : colors.darkText}
                  style={styles.menuIcon}
                />
                <Text
                  style={[styles.menuLabel, isActive && styles.menuLabelActive]}
                >
                  {item.label}
                </Text>
                {item.badge && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Secondary Menu Items */}
        <View style={styles.menuSection}>
          {secondaryItems.map((item) => {
            const isActive = activeRoute === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Icon
                  name={(isActive && item.activeIcon) ? item.activeIcon : item.icon}
                  size={24}
                  color={isActive ? colors.primary : colors.darkText}
                  style={styles.menuIcon}
                />
                <Text
                  style={[styles.menuLabel, isActive && styles.menuLabelActive]}
                >
                  {item.label}
                </Text>
                {item.badge && (
                  <View
                    style={[
                      styles.menuBadge,
                      { backgroundColor: item.badgeColor || colors.emergencyRed },
                    ]}
                  >
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.appInfo}>
          <Icon name="security" size={32} color={colors.primary} style={styles.appLogo} />
          <View>
            <Text style={styles.appName}>SafeTNet Security</Text>
            <Text style={styles.appVersion}>v2.2.0</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.darkText,
    fontWeight: '600',
    lineHeight: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: colors.secondary, // #1E3A8A
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.white,
  },
  profileImagePlaceholder: {
    backgroundColor: colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.online,
    borderWidth: 3,
    borderColor: colors.secondary,
  },
  officerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
  officerRole: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  badgeNumber: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.white,
    opacity: 0.7,
    marginTop: 2,
  },
  menuSection: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)', // Light blue tint
    borderLeftColor: colors.primary,
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  appLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkText,
    letterSpacing: -0.2,
  },
  menuLabelActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  menuBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.emergencyRed,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  menuBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.lightGrayBg,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkText,
  },
  appVersion: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.captionText,
    marginTop: 2,
  },
});

