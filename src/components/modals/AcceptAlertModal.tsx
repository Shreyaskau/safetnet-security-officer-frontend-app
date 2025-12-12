import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Alert } from '../../types/alert.types';
import { Button } from '../common/Button';
import { colors, typography, spacing } from '../../utils';
import { formatRelativeTime, calculateDistance } from '../../utils/helpers';

interface AcceptAlertModalProps {
  visible: boolean;
  alert: Alert | null;
  officerLocation: { latitude: number; longitude: number } | null;
  estimatedArrival?: number;
  onConfirm: () => void;
  onCancel: () => void;
  onCall?: () => void;
  onViewLocation?: () => void;
}

export const AcceptAlertModal: React.FC<AcceptAlertModalProps> = ({
  visible,
  alert,
  officerLocation,
  estimatedArrival,
  onConfirm,
  onCancel,
  onCall,
  onViewLocation,
}) => {
  if (!alert) return null;

  const distance = officerLocation
    ? calculateDistance(
        officerLocation.latitude,
        officerLocation.longitude,
        alert.location.latitude,
        alert.location.longitude
      )
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>🛡️</Text>
              </View>
            </View>

            <Text style={styles.title}>Accept Emergency Request?</Text>

            <View style={styles.userCard}>
              <Image
                source={{ uri: alert.user_image || 'https://via.placeholder.com/48' }}
                style={styles.profileImage}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{alert.user_name || 'Unknown User'}</Text>
                <Text style={styles.userLocation}>
                  📍 {alert.location?.address || 'Location not available'}
                </Text>
                {distance !== null && distance !== undefined && (
                  <Text style={styles.distance}>{distance.toFixed(1)} mi away</Text>
                )}
                <Text style={styles.time}>
                  ⏰ {alert.timestamp ? formatRelativeTime(alert.timestamp) : 'Just now'}
                </Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                You will be marked as responding. User will be notified of your
                response.
              </Text>
            </View>

            {estimatedArrival !== null && estimatedArrival !== undefined && estimatedArrival > 0 && (
              <View style={styles.etaContainer}>
                <Text style={styles.etaLabel}>Estimated Arrival</Text>
                <Text style={styles.etaValue}>~{estimatedArrival} minutes</Text>
              </View>
            )}

            <Text style={styles.disclaimer}>
              This action cannot be undone.
            </Text>

            <Button
              title="CONFIRM & RESPOND"
              onPress={onConfirm}
              variant="primary"
              style={styles.confirmButton}
              icon={<Text style={styles.buttonIcon}>🛡️</Text>}
            />

            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>

            <View style={styles.quickActions}>
              {onCall && (
                <TouchableOpacity onPress={onCall} style={styles.quickAction}>
                  <Text style={styles.quickActionText}>📞 Call First</Text>
                </TouchableOpacity>
              )}
              {onViewLocation && (
                <TouchableOpacity
                  onPress={onViewLocation}
                  style={styles.quickAction}
                >
                  <Text style={styles.quickActionText}>📍 View Location</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.badgeBlueBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
  },
  title: {
    ...typography.screenHeader,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: colors.lightGrayBg,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.emergencyRed,
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.cardTitle,
    marginBottom: spacing.xs,
  },
  userLocation: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: spacing.xs,
  },
  distance: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  time: {
    ...typography.caption,
    color: colors.mediumGray,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  warningText: {
    ...typography.caption,
    color: '#78350F',
    flex: 1,
  },
  etaContainer: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  etaLabel: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: spacing.xs,
  },
  etaValue: {
    ...typography.screenHeader,
    fontSize: 24,
    color: colors.successGreen,
    fontWeight: 'bold',
  },
  disclaimer: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.mediumGray,
    marginBottom: spacing.base,
  },
  confirmButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  buttonIcon: {
    fontSize: 18,
  },
  cancelButton: {
    width: '100%',
    height: 48,
    borderWidth: 2,
    borderColor: colors.borderGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cancelText: {
    ...typography.buttonLarge,
    color: colors.lightText,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  quickAction: {
    paddingVertical: spacing.sm,
  },
  quickActionText: {
    ...typography.secondary,
    color: colors.primary,
  },
});

