import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Alert } from '../../types/alert.types';
import { colors, shadows } from '../../utils';
import { formatRelativeTime } from '../../utils/helpers';

interface AlertCardProps {
  alert: Alert;
  onRespond: (alert: Alert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onRespond }) => {
  const isEmergency = alert.alert_type === 'emergency';
  const isCompleted = alert.status === 'completed';

  const getBadgeStyle = () => {
    if (isEmergency) {
      return {
        backgroundColor: colors.badgeRedBg,
        text: '🚨 EMERGENCY',
        textColor: colors.emergencyRed,
      };
    }
    if (isCompleted) {
      return {
        backgroundColor: colors.badgeGreenBg,
        text: '✓ COMPLETED',
        textColor: colors.successGreen,
      };
    }
    return {
      backgroundColor: colors.badgeBlueBg,
      text: '🔔 NORMAL',
      textColor: colors.infoBlue,
    };
  };

  const badgeStyle = getBadgeStyle();

  const getProfileBorderColor = () => {
    if (isEmergency) return colors.emergencyRed;
    if (isCompleted) return colors.successGreen;
    return colors.infoBlue;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isEmergency && styles.emergencyCard,
        isCompleted && styles.completedCard,
      ]}
      activeOpacity={0.9}
    >
      <View
        style={[
          styles.leftAccent,
          {
            backgroundColor: isEmergency
              ? colors.emergencyRed
              : (isCompleted ? colors.successGreen : colors.infoBlue),
          },
        ]}
      />

      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: alert.user_image || 'https://via.placeholder.com/56' }}
          style={[
            styles.profileImage,
            { borderColor: getProfileBorderColor() },
          ]}
        />
        {isEmergency && !isCompleted && (
          <View style={styles.pulsingDot} />
        )}
      </View>

      <View style={styles.content}>
        <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.textColor }]}>
            {badgeStyle.text}
          </Text>
        </View>

        <Text style={[styles.userName, isCompleted && styles.completedText]}>
          {alert.user_name}
        </Text>
        <Text style={[styles.message, isCompleted && styles.completedText]} numberOfLines={2}>
          {alert.message}
        </Text>

        <Text style={[styles.location, isCompleted && styles.completedText]}>
          📍 {alert.location.address}
        </Text>

        <Text style={[styles.timestamp, isCompleted && styles.completedText]}>
          {formatRelativeTime(alert.timestamp)}
        </Text>
      </View>

      <View style={styles.actions}>
        {isCompleted ? (
          <Text style={styles.completedStatus}>
            Completed {formatRelativeTime(alert.updated_at || alert.timestamp)}
          </Text>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.respondButton,
                isEmergency && styles.respondButtonEmergency,
              ]}
              onPress={() => onRespond(alert)}
              activeOpacity={0.7}
            >
              <Text style={styles.respondButtonText}>RESPOND</Text>
            </TouchableOpacity>
            {alert.distance && (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{alert.distance} mi away</Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shadows.md,
  },
  emergencyCard: {
    ...shadows.emergency, // Red shadow for emergency
  },
  completedCard: {
    opacity: 0.6,
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'transparent', // Changed dynamically
  },
  pulsingDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.emergencyRed,
    borderWidth: 2,
    borderColor: colors.white,
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12, // Pill shape
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkText,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.lightText,
    lineHeight: 20,
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.captionText,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.captionText,
  },
  completedText: {
    opacity: 0.7,
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 90,
  },
  respondButton: {
    width: 90,
    height: 36,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  respondButtonEmergency: {
    backgroundColor: colors.emergencyRed,
  },
  respondButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.3,
  },
  distanceBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.lightGrayBg,
    borderRadius: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.captionText,
  },
  completedStatus: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.captionText,
    textAlign: 'center',
  },
});
