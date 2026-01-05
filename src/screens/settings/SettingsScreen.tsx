import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  setNotificationsEnabled,
  setLocationTrackingEnabled,
  setOnDuty,
  setTheme,
  ThemeMode,
} from '../../redux/slices/settingsSlice';
import { LogoutModal } from '../../components/modals/LogoutModal';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../redux/slices/authSlice';
import { colors, typography, spacing } from '../../utils';
import { testConnection, getAPIConfig, ConnectionStatus } from '../../api/services/connectionTestService';
import { requestLocationPermission } from '../../utils/permissions';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const SettingsScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const officer = useAppSelector((state) => state.auth.officer);
  const { logout: logoutUser } = useAuth();
  const { colors: themeColors, themeMode, setThemeMode, effectiveTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);

  const handleLogout = async () => {
    if (officer) {
      await logoutUser(officer.security_id, 'security');
    }
    dispatch(logout());
    setShowLogoutModal(false);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const status = await testConnection();
      setConnectionStatus(status);
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        baseURL: getAPIConfig().baseURL,
        error: 'Failed to test connection',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleLocationTrackingToggle = async (value: boolean) => {
    if (value) {
      // When enabling location tracking, request permission first
      const granted = await requestLocationPermission();
      if (granted) {
        dispatch(setLocationTrackingEnabled(true));
      } else {
        // Permission denied - show alert
        Alert.alert(
          'Location Permission Required',
          'Location permission is required for the map to show your current location. Please grant permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                // On Android, you can open app settings
                if (Platform.OS === 'android') {
                  // Linking.openSettings(); // Would need to import Linking
                }
              }
            }
          ]
        );
      }
    } else {
      // Just disable tracking if user turns it off
      dispatch(setLocationTrackingEnabled(false));
    }
  };

  // Use theme colors for dynamic styling
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      backgroundColor: effectiveTheme === 'dark' ? themeColors.background : themeColors.lightGrayBg, // Pure black in dark mode
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    section: {
      marginTop: spacing.lg,
      backgroundColor: themeColors.lightGrayBg, // Use dark gray for sections in dark mode
      paddingVertical: spacing.md,
    },
    sectionTitle: {
      ...typography.caption,
      color: themeColors.lightText,
      textTransform: 'uppercase',
      paddingHorizontal: spacing.base,
      marginBottom: spacing.sm,
      fontWeight: '600',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    settingLabel: {
      ...typography.body,
      marginBottom: spacing.xs,
      color: themeColors.text,
    },
    settingDescription: {
      ...typography.caption,
      color: themeColors.lightText,
    },
    settingButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    settingButtonText: {
      ...typography.body,
      color: themeColors.text,
    },
    chevron: {
      fontSize: 24,
      color: themeColors.mediumGray,
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: themeColors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={dynamicStyles.section}>
        <Text style={styles.sectionTitle}>GENERAL</Text>

        <View style={dynamicStyles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={dynamicStyles.settingLabel}>On Duty</Text>
            <Text style={dynamicStyles.settingDescription}>
              Mark yourself as on duty to receive alerts
            </Text>
          </View>
          <Switch
            value={settings.onDuty}
            onValueChange={(value) => {
              dispatch(setOnDuty(value));
            }}
            trackColor={{
              false: themeColors.mediumGray,
              true: themeColors.successGreen,
            }}
            thumbColor={themeColors.white}
          />
        </View>

        <View style={dynamicStyles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={dynamicStyles.settingLabel}>Location Tracking</Text>
            <Text style={dynamicStyles.settingDescription}>
              Allow app to track your location for maps and alerts
            </Text>
          </View>
          <Switch
            value={settings.locationTrackingEnabled}
            onValueChange={handleLocationTrackingToggle}
            trackColor={{
              false: themeColors.mediumGray,
              true: themeColors.primary,
            }}
            thumbColor={themeColors.white}
          />
        </View>

        <TouchableOpacity
          style={dynamicStyles.settingButton}
          onPress={async () => {
            const granted = await requestLocationPermission();
            if (granted) {
              Alert.alert('Success', 'Location permission granted! The map can now show your current location.');
              dispatch(setLocationTrackingEnabled(true));
            } else {
              Alert.alert(
                'Permission Denied',
                'Location permission is required for the Leaflet map. Please grant permission in your device settings.',
                [{ text: 'OK' }]
              );
            }
          }}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Request Location Permission</Text>
            <Text style={styles.settingDescription}>
              Grant permission for Leaflet map to access your location
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={dynamicStyles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={dynamicStyles.settingLabel}>Theme</Text>
            <Text style={dynamicStyles.settingDescription}>
              Choose your preferred theme appearance
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowThemeOptions(!showThemeOptions)}
            style={[styles.themeSelector, { borderColor: themeColors.border }]}
          >
            <Text style={[styles.themeSelectorText, { color: themeColors.text }]}>
              {themeMode === 'light' ? '☀️ Light' : themeMode === 'dark' ? '🌙 Dark' : '⚙️ System'}
            </Text>
            <Icon 
              name={showThemeOptions ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
              size={24} 
              color={themeColors.text} 
            />
          </TouchableOpacity>
        </View>

        {showThemeOptions && (
          <View style={[styles.themeOptionsContainer, { backgroundColor: themeColors.lightGrayBg }]}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                { backgroundColor: themeColors.white, borderColor: 'transparent' },
                themeMode === 'light' && { backgroundColor: themeColors.badgeBlueBg, borderColor: themeColors.primary },
              ]}
              onPress={() => {
                setThemeMode('light');
                setShowThemeOptions(false);
              }}
            >
              <Text style={styles.themeOptionIcon}>☀️</Text>
              <View style={styles.themeOptionContent}>
                <Text style={[
                  styles.themeOptionLabel,
                  { color: themeColors.text },
                  themeMode === 'light' && { color: themeColors.primary, fontWeight: '600' },
                ]}>
                  Light
                </Text>
                <Text style={[styles.themeOptionDescription, { color: themeColors.lightText }]}>
                  Always use light theme
                </Text>
              </View>
              {themeMode === 'light' && (
                <Icon name="check-circle" size={24} color={themeColors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { backgroundColor: themeColors.white, borderColor: 'transparent' },
                themeMode === 'dark' && { backgroundColor: themeColors.badgeBlueBg, borderColor: themeColors.primary },
              ]}
              onPress={() => {
                setThemeMode('dark');
                setShowThemeOptions(false);
              }}
            >
              <Text style={styles.themeOptionIcon}>🌙</Text>
              <View style={styles.themeOptionContent}>
                <Text style={[
                  styles.themeOptionLabel,
                  { color: themeColors.text },
                  themeMode === 'dark' && { color: themeColors.primary, fontWeight: '600' },
                ]}>
                  Dark
                </Text>
                <Text style={[styles.themeOptionDescription, { color: themeColors.lightText }]}>
                  Always use dark theme
                </Text>
              </View>
              {themeMode === 'dark' && (
                <Icon name="check-circle" size={24} color={themeColors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { backgroundColor: themeColors.white, borderColor: 'transparent' },
                themeMode === 'system' && { backgroundColor: themeColors.badgeBlueBg, borderColor: themeColors.primary },
              ]}
              onPress={() => {
                setThemeMode('system');
                setShowThemeOptions(false);
              }}
            >
              <Text style={styles.themeOptionIcon}>⚙️</Text>
              <View style={styles.themeOptionContent}>
                <Text style={[
                  styles.themeOptionLabel,
                  { color: themeColors.text },
                  themeMode === 'system' && { color: themeColors.primary, fontWeight: '600' },
                ]}>
                  System Default
                </Text>
                <Text style={[styles.themeOptionDescription, { color: themeColors.lightText }]}>
                  Follow device theme setting
                </Text>
              </View>
              {themeMode === 'system' && (
                <Icon name="check-circle" size={24} color={themeColors.primary} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>


      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  backIcon: {
    fontSize: 24,
    color: colors.darkText,
  },
  title: {
    ...typography.sectionHeader,
  },
  placeholder: {
    width: 24,
  },
  section: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.lightText,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  settingLeft: {
    flex: 1,
    marginRight: spacing.base,
  },
  settingLabel: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.lightText,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  settingButtonText: {
    ...typography.body,
  },
  chevron: {
    fontSize: 24,
    color: colors.mediumGray,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: colors.emergencyRed,
  },
  connectionStatus: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.lightGrayBg,
    marginTop: spacing.sm,
    borderRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.lightText,
    marginRight: spacing.xs,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  statusConnected: {
    backgroundColor: colors.successGreen,
  },
  statusDisconnected: {
    backgroundColor: colors.emergencyRed,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  statusTextConnected: {
    color: colors.successGreen,
  },
  statusTextDisconnected: {
    color: colors.emergencyRed,
  },
  statusInfo: {
    ...typography.caption,
    color: colors.lightText,
    marginTop: spacing.xs,
    fontSize: 11,
  },
  statusError: {
    ...typography.caption,
    color: colors.emergencyRed,
    marginTop: spacing.xs,
    fontSize: 11,
  },
  statusTimestamp: {
    ...typography.caption,
    color: colors.lightText,
    marginTop: spacing.xs,
    fontSize: 10,
    fontStyle: 'italic',
  },
  statusSuccess: {
    color: colors.successGreen,
  },
  statusWarning: {
    color: colors.warningOrange || '#FFA500',
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderGray,
    minWidth: 120,
  },
  themeSelectorText: {
    ...typography.body,
    marginRight: spacing.xs,
    color: colors.darkText,
  },
  themeOptionsContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    marginTop: spacing.xs,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    // Active state applied via inline styles
  },
  themeOptionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  themeOptionContent: {
    flex: 1,
  },
  themeOptionLabel: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: colors.darkText,
  },
  themeOptionLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  themeOptionDescription: {
    ...typography.caption,
    color: colors.lightText,
  },
});












