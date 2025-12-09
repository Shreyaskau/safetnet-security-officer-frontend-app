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
import { setLocationTrackingEnabled } from '../../redux/slices/settingsSlice';
import { colors, typography, spacing } from '../../utils';

export const PrivacyScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const locationTrackingEnabled = useAppSelector(
    (state) => state.settings.locationTrackingEnabled
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LOCATION</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Location Tracking</Text>
            <Text style={styles.settingDescription}>
              Allow app to track your location for emergency response
            </Text>
          </View>
          <Switch
            value={locationTrackingEnabled}
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

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Location data is used to help respond to emergencies in your
            assigned area. Your location is only shared when you're on duty.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Data Collection:</Text> We collect
            location data, alert history, and response times to improve service.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Data Storage:</Text> Your data is
            stored securely and encrypted. We never share your personal
            information with third parties.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Data Deletion:</Text> You can request
            deletion of your data by contacting support.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Request Data Export</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.deleteButton]}>
          <Text style={[styles.buttonText, styles.deleteButtonText]}>
            Request Data Deletion
          </Text>
        </TouchableOpacity>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.badgeBlueBg,
    padding: spacing.md,
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
    borderRadius: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.secondary,
    flex: 1,
  },
  boldText: {
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.buttonLarge,
    color: colors.white,
  },
  deleteButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.emergencyRed,
  },
  deleteButtonText: {
    color: colors.emergencyRed,
  },
});

