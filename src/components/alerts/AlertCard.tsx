import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert as RNAlert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Alert } from '../../types/alert.types';
import { colors, shadows } from '../../utils';
import { formatRelativeTime, formatExactTime } from '../../utils/helpers';

interface AlertCardProps {
  alert: Alert;
  onRespond: (alert: Alert) => void;
  onDelete?: (alert: Alert) => void;
  onSolve?: (alert: Alert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onRespond, onDelete, onSolve }) => {
  // Check if emergency based on original_alert_type or alert_type
  // original_alert_type: 'emergency' or 'warning' (both are emergencies)
  // alert_type: 'emergency' (backend stored value)
  const isEmergency = alert.original_alert_type === 'emergency' || 
                      alert.original_alert_type === 'warning' ||
                      alert.alert_type === 'emergency';
  // Check if alert is completed or resolved (handle both statuses, case-insensitive)
  const alertStatus = alert.status ? String(alert.status).toLowerCase() : '';
  const isCompleted = alertStatus === 'completed' || alertStatus === 'resolved';
  const isAccepted = alert.status === 'accepted';

  const handleDelete = () => {
    RNAlert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete && onDelete(alert),
        },
      ]
    );
  };


  // Get alert type description - show the exact type that user selected
  const getAlertTypeDescription = (): { type: string; description: string } => {
    // Check if this is a high priority alert - show as "Emergency Alert"
    const isHighPriority = alert.priority?.toLowerCase() === 'high';
    
    if (isHighPriority) {
      return {
        type: 'Emergency Alert',
        description: 'Critical alert requiring immediate response and action'
      };
    }
    
    // ALWAYS prefer original_alert_type if available (what user actually selected)
    // This is the EXACT type from the creation page: 'general', 'warning', or 'emergency'
    // Only fall back to alert_type if original_alert_type is not available
    const displayType = alert.original_alert_type || alert.alert_type || 'normal';
    
    // Log for debugging to see what we're displaying
    if (!alert.original_alert_type && !alert.alert_type) {
      console.warn('[AlertCard] ⚠️ No alert type found, using default:', {
        id: alert.id,
        original_alert_type: alert.original_alert_type,
        alert_type: alert.alert_type,
        displayType: displayType,
      });
    } else if (!alert.original_alert_type) {
      console.log('[AlertCard] ⚠️ Using fallback alert_type:', {
        id: alert.id,
        original_alert_type: alert.original_alert_type,
        alert_type: alert.alert_type,
        displayType: displayType,
      });
    }
    
    const typeInfoMap: Record<string, { type: string; description: string }> = {
      // Original types (what user selects on creation page)
      general: {
        type: 'General Notice',
        description: 'Informational alert for general updates and announcements'
      },
      warning: {
        type: 'Warning',
        description: 'Cautionary alert requiring attention and immediate awareness'
      },
      emergency: {
        type: 'Emergency',
        description: 'Critical alert requiring immediate response and action'
      },
      // Backend stored types (fallback - should not be used if original_alert_type exists)
      normal: {
        type: 'Normal Alert',
        description: 'Standard alert for routine notifications'
      },
      security: {
        type: 'Security Alert',
        description: 'Security-related alert requiring security personnel attention'
      },
    };
    
    // Ensure displayType is a string before using it
    const safeDisplayType = typeof displayType === 'string' ? displayType : 'normal';
    
    // Return type info or default
    return typeInfoMap[safeDisplayType] || {
      type: safeDisplayType.charAt(0).toUpperCase() + safeDisplayType.slice(1) + ' Alert',
      description: 'Alert notification'
    };
  };

  // Get priority label
  const getPriorityLabel = (): string => {
    if (!alert.priority) return '';
    const priorityMap: Record<string, string> = {
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
    };
    return priorityMap[alert.priority] || '';
  };

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
        text: '✓ SOLVED',
        textColor: colors.successGreen,
      };
    }
    return {
      backgroundColor: colors.badgeBlueBg,
      text: '🔔 ACTIVE',
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
    <View
      style={[
        styles.card,
        isEmergency && styles.emergencyCard,
        isCompleted && styles.completedCard,
      ]}
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

      <View style={styles.cardContent}>
        {/* Status Badge - Shows SOLVED for completed alerts, ACTIVE/EMERGENCY for remaining */}
        <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.textColor }]}>
            {badgeStyle.text}
          </Text>
        </View>
        <View style={styles.content}>
          {/* Alert Type and Priority Details */}
          <View style={styles.alertDetailsRow}>
            <View style={styles.alertTypeContainer}>
              <Icon 
                name={
                  isEmergency 
                    ? 'warning' 
                    : alert.alert_type === 'security' 
                      ? 'security' 
                      : 'notifications' // Material design icon for normal alerts
                } 
                size={14} 
                color={isEmergency ? colors.emergencyRed : colors.infoBlue} 
              />
              <View style={styles.alertTypeInfo}>
                <Text style={[styles.alertTypeText, isCompleted && styles.completedText]}>
                  {getAlertTypeDescription().type}
                </Text>
                <Text style={[styles.alertTypeDescription, isCompleted && styles.completedText]} numberOfLines={1}>
                  {getAlertTypeDescription().description}
                </Text>
              </View>
            </View>
            {alert.priority && (
              <View style={[
                styles.priorityBadge,
                alert.priority === 'high' && styles.priorityHigh,
                alert.priority === 'medium' && styles.priorityMedium,
              ]}>
                <Text style={styles.priorityText}>{alert.priority.toUpperCase()}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.userName, isCompleted && styles.completedText]}>
            {alert.user_name}
          </Text>
          <Text style={[styles.message, isCompleted && styles.completedText]} numberOfLines={2}>
            {alert.message}
          </Text>

          <Text style={[styles.timestamp, isCompleted && styles.completedText]}>
            {formatExactTime(alert.created_at || alert.timestamp)}
          </Text>
          <Text style={[styles.relativeTime, isCompleted && styles.completedText]}>
            {formatRelativeTime(alert.created_at || alert.timestamp)}
          </Text>
        </View>

        {/* Bottom buttons section */}
        {isCompleted ? (
          <View style={styles.completedActions}>
            <View style={styles.solvedBadge}>
              <Icon name="check-circle" size={18} color={colors.successGreen} />
              <Text style={styles.solvedBadgeText}>SOLVED</Text>
            </View>
          </View>
        ) : isAccepted ? (
          <View style={styles.acceptedActions}>
            {onSolve ? (
              <TouchableOpacity
                style={styles.solveButton}
                onPress={() => onSolve(alert)}
                activeOpacity={0.7}
              >
                <Icon name="check-circle" size={18} color={colors.white} />
                <Text style={styles.solveButtonText}>MARK SOLVED</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.acceptedBadge}>
                <Icon name="check-circle" size={18} color={colors.successGreen} />
                <Text style={styles.acceptedText}>RESPOND ACCEPTED</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.respondButtonBottom,
                isEmergency && styles.respondButtonBottomEmergency,
              ]}
              onPress={() => onRespond(alert)}
              activeOpacity={0.7}
            >
              <Text style={styles.respondButtonBottomText}>RESPOND</Text>
            </TouchableOpacity>
            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButtonBottom}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Icon name="delete" size={18} color={colors.emergencyRed} />
                <Text style={styles.deleteButtonText}>DELETE</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
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
  cardContent: {
    flex: 1,
    paddingLeft: 4, // Small padding to account for left accent
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.emergencyRed,
    marginLeft: 8,
  },
  badge: {
    alignSelf: 'flex-start', // Left-align badge
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
  alertDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#E5E7EB',
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flex: 1,
  },
  alertTypeInfo: {
    flex: 1,
  },
  alertTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkText,
    marginBottom: 2,
  },
  alertTypeDescription: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.captionText,
    lineHeight: 14,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.lightGrayBg,
  },
  priorityHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  priorityMedium: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.darkText,
    letterSpacing: 0.5,
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
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.captionText,
  },
  relativeTime: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.captionText,
    marginTop: 2,
    opacity: 0.8,
  },
  completedText: {
    opacity: 0.7,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border || '#E5E7EB',
  },
  respondButtonBottom: {
    flex: 1,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  respondButtonBottomEmergency: {
    backgroundColor: colors.emergencyRed,
  },
  respondButtonBottomText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
  deleteButtonBottom: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.emergencyRed,
    letterSpacing: 0.5,
  },
  completedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border || '#E5E7EB',
  },
  solvedBadge: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.badgeGreenBg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  solvedBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.successGreen,
    letterSpacing: 0.5,
  },
  acceptedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border || '#E5E7EB',
  },
  acceptedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.badgeGreenBg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  acceptedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.successGreen,
    letterSpacing: 0.5,
  },
  solveButton: {
    width: '100%',
    height: 44,
    backgroundColor: colors.successGreen,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...shadows.md,
  },
  solveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
});
