import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { colors, typography, spacing } from '../../utils';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export const NotificationPermissionScreen = ({ navigation }: any) => {
  const { requestPermission } = usePushNotifications();

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      navigation.goBack();
    }
  };

  const handleLater = () => {
    navigation.goBack();
  };

  const features = [
    {
      icon: '⚡',
      title: 'Instant Notifications',
      description: 'Receive emergency alerts in real-time',
    },
    {
      icon: '🔊',
      title: 'Critical Alerts',
      description: 'Sound & vibration even in silent mode.',
    },
    {
      icon: '📍',
      title: 'Location Updates',
      description: 'Get directions to users who need help.',
    },
    {
      icon: '🛡️',
      title: 'Priority Delivery',
      description: 'Emergencies bypass Do Not Disturb.',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <Text style={styles.bellIcon}>🔔</Text>
        <View style={styles.waveContainer}>
          <View style={[styles.wave, styles.wave1]} />
          <View style={[styles.wave, styles.wave2]} />
          <View style={[styles.wave, styles.wave3]} />
        </View>
      </View>

      <Text style={styles.title}>Stay Informed</Text>
      <Text style={styles.subtitle}>Never miss an emergency alert</Text>

      <View style={styles.featuresList}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          You can manage notification settings anytime in your profile.
        </Text>
      </View>

      <Button
        title="ENABLE NOTIFICATIONS"
        onPress={handleEnable}
        variant="primary"
        style={styles.enableButton}
      />

      <TouchableOpacity onPress={handleLater} style={styles.laterButton}>
        <Text style={styles.laterText}>Maybe Later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 80,
    zIndex: 2,
  },
  waveContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 0.3,
  },
  wave1: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  wave2: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  wave3: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    ...typography.screenHeader,
    fontSize: 28,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.lightText,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  featuresList: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    padding: spacing.md,
    backgroundColor: colors.lightGrayBg,
    borderRadius: 12,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.cardTitle,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.secondary,
    color: colors.lightText,
  },
  infoBanner: {
    backgroundColor: '#FEF3C7',
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.lg,
    width: '100%',
  },
  infoText: {
    ...typography.caption,
    color: '#92400E',
    textAlign: 'center',
  },
  enableButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  laterButton: {
    paddingVertical: spacing.md,
  },
  laterText: {
    ...typography.body,
    color: colors.lightText,
    textDecorationLine: 'underline',
  },
});












