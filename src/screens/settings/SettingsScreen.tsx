import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  setNotificationsEnabled,
  setLocationTrackingEnabled,
  setOnDuty,
} from '../../redux/slices/settingsSlice';
import { LogoutModal } from '../../components/modals/LogoutModal';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../redux/slices/authSlice';
import { colors, typography, spacing } from '../../utils';
import { testConnection, getAPIConfig, ConnectionStatus } from '../../api/services/connectionTestService';

export const SettingsScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const officer = useAppSelector((state) => state.auth.officer);
  const { logout: logoutUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GENERAL</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>On Duty</Text>
            <Text style={styles.settingDescription}>
              Mark yourself as on duty to receive alerts
            </Text>
          </View>
          <Switch
            value={settings.onDuty}
            onValueChange={(value) => dispatch(setOnDuty(value))}
            trackColor={{
              false: colors.mediumGray,
              true: colors.successGreen,
            }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Location Tracking</Text>
            <Text style={styles.settingDescription}>
              Allow app to track your location
            </Text>
          </View>
          <Switch
            value={settings.locationTrackingEnabled}
            onValueChange={(value) =>
              dispatch(setLocationTrackingEnabled(value))
            }
            trackColor={{
              false: colors.mediumGray,
              true: colors.primary,
            }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive emergency alerts via push notifications
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) =>
              dispatch(setNotificationsEnabled(value))
            }
            trackColor={{
              false: colors.mediumGray,
              true: colors.primary,
            }}
            thumbColor={colors.white}
          />
        </View>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Text style={styles.settingButtonText}>Notification Preferences</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PRIVACY</Text>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => navigation.navigate('Privacy')}
        >
          <Text style={styles.settingButtonText}>Privacy Settings</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NAVIGATION</Text>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.settingButtonText}>🏠 Home</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => navigation.navigate('Logs')}
        >
          <Text style={styles.settingButtonText}>📋 Logs</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => navigation.navigate('GeofenceArea')}
        >
          <Text style={styles.settingButtonText}>🗺️ Geofence Area</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => navigation.navigate('Broadcast')}
        >
          <Text style={styles.settingButtonText}>📨 Send Alert</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONNECTION</Text>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={handleTestConnection}
          disabled={isTestingConnection}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Test Backend Connection</Text>
            <Text style={styles.settingDescription}>
              Check if backend API is reachable
            </Text>
          </View>
          {isTestingConnection ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.chevron}>›</Text>
          )}
        </TouchableOpacity>

        {connectionStatus && (
          <View style={styles.connectionStatus}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Backend API:</Text>
              <View
                style={[
                  styles.statusIndicator,
                  connectionStatus.isConnected
                    ? styles.statusConnected
                    : styles.statusDisconnected,
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  connectionStatus.isConnected
                    ? styles.statusTextConnected
                    : styles.statusTextDisconnected,
                ]}
              >
                {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>

            {connectionStatus.databaseConnected !== undefined && (
              <View style={[styles.statusRow, { marginTop: spacing.xs }]}>
                <Text style={styles.statusLabel}>Database:</Text>
                <View
                  style={[
                    styles.statusIndicator,
                    connectionStatus.databaseConnected
                      ? styles.statusConnected
                      : styles.statusDisconnected,
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    connectionStatus.databaseConnected
                      ? styles.statusTextConnected
                      : styles.statusTextDisconnected,
                  ]}
                >
                  {connectionStatus.databaseConnected ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            )}

            <Text style={styles.statusInfo}>Base URL: {connectionStatus.baseURL}</Text>
            {connectionStatus.apiEndpoint && (
              <Text style={styles.statusInfo}>
                API Endpoint: {connectionStatus.apiEndpoint}
              </Text>
            )}
            {connectionStatus.responseTime && (
              <Text style={styles.statusInfo}>
                Response Time: {connectionStatus.responseTime}ms
              </Text>
            )}
            {connectionStatus.statusCode && (
              <Text style={styles.statusInfo}>
                Status Code: {connectionStatus.statusCode}
              </Text>
            )}
            {connectionStatus.databaseTestResult && (
              <Text
                style={[
                  styles.statusInfo,
                  connectionStatus.databaseConnected
                    ? styles.statusSuccess
                    : styles.statusWarning,
                ]}
              >
                DB Test: {connectionStatus.databaseTestResult}
              </Text>
            )}
            {connectionStatus.error && (
              <Text style={styles.statusError}>Error: {connectionStatus.error}</Text>
            )}
            <Text style={styles.statusTimestamp}>
              Tested: {new Date(connectionStatus.timestamp).toLocaleString()}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => navigation.navigate('APITest')}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>🧪 Test All APIs</Text>
            <Text style={styles.settingDescription}>
              Run comprehensive API test suite
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.settingButtonText}>View Profile</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingButton, styles.logoutButton]}
          onPress={() => setShowLogoutModal(true)}
        >
          <Text style={[styles.settingButtonText, styles.logoutText]}>
            Logout
          </Text>
        </TouchableOpacity>
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
    color: colors.warningYellow || '#FFA500',
  },
});












