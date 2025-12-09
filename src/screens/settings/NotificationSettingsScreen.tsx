import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setNotificationsEnabled } from '../../redux/slices/settingsSlice';
import { colors, typography, spacing } from '../../utils';

export const NotificationSettingsScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const notificationsEnabled = useAppSelector(
    (state) => state.settings.notificationsEnabled
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive push notifications for emergency alerts
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(value) => dispatch(setNotificationsEnabled(value))}
            trackColor={{
              false: colors.mediumGray,
              true: colors.primary,
            }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ALERT TYPES</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Emergency Alerts</Text>
            <Text style={styles.settingDescription}>
              Critical alerts with sound and vibration
            </Text>
          </View>
          <Switch
            value={true}
            disabled
            trackColor={{
              false: colors.mediumGray,
              true: colors.emergencyRed,
            }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Normal Alerts</Text>
            <Text style={styles.settingDescription}>
              Standard security alerts
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(value) => dispatch(setNotificationsEnabled(value))}
            trackColor={{
              false: colors.mediumGray,
              true: colors.infoBlue,
            }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SOUND & VIBRATION</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Sound</Text>
            <Text style={styles.settingDescription}>
              Play sound for notifications
            </Text>
          </View>
          <Switch
            value={true}
            trackColor={{
              false: colors.mediumGray,
              true: colors.primary,
            }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Text style={styles.settingDescription}>
              Vibrate device for notifications
            </Text>
          </View>
          <Switch
            value={true}
            trackColor={{
              false: colors.mediumGray,
              true: colors.primary,
            }}
            thumbColor={colors.white}
          />
        </View>
      </View>
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
});












