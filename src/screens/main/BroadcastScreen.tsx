import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import { Button } from '../../components/common/Button';
import { BroadcastProgressModal } from '../../components/modals/BroadcastProgressModal';
import { broadcastService } from '../../api/services/broadcastService';
import { colors, typography, spacing } from '../../utils';
import Toast from 'react-native-toast-message';

export const BroadcastScreen = ({ navigation }: any) => {
  const officer = useAppSelector((state) => state.auth.officer);
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState<'general' | 'warning' | 'all_clear'>('general');
  const [highPriority, setHighPriority] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [totalUsers] = useState(24);

  const alertTypes = [
    { key: 'general' as const, label: '🔔 General Notice', icon: '🔔' },
    { key: 'warning' as const, label: '⚠️ Warning', icon: '⚠️' },
    { key: 'all_clear' as const, label: '✅ All Clear', icon: '✅' },
  ];

  const handleSend = async () => {
    if (!message.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a message',
      });
      return;
    }

    if (!officer) return;

    setShowProgress(true);
    setBroadcastProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setBroadcastProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await broadcastService.sendBroadcast({
        security_id: officer.security_id,
        geofence_id: officer.geofence_id,
        message: message.trim(),
        alert_type: alertType,
        priority: highPriority,
      });

      clearInterval(progressInterval);
      setBroadcastProgress(100);

      setTimeout(() => {
        setShowProgress(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Broadcast sent successfully',
        });
        navigation.goBack();
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      setShowProgress(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send broadcast',
      });
    }
  };

  return (
    <View style={styles.container}>
      <BroadcastProgressModal
        visible={showProgress}
        progress={broadcastProgress}
        totalUsers={totalUsers}
        onCancel={() => {
          setShowProgress(false);
          setBroadcastProgress(0);
        }}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SEND ALERT</Text>
        <TouchableOpacity>
          <Text style={styles.infoIcon}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            ℹ️ Message will be sent to all 24 active users in your area
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ALERT TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {alertTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.alertTypePill,
                  alertType === type.key && styles.selectedPill,
                ]}
                onPress={() => setAlertType(type.key)}
              >
                <Text
                  style={[
                    styles.alertTypeText,
                    alertType === type.key && styles.selectedPillText,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            placeholderTextColor={colors.mediumGray}
            multiline
            numberOfLines={8}
            value={message}
            onChangeText={setMessage}
            maxLength={500}
          />
          <Text style={styles.charCount}>{message.length} / 500</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK TEMPLATES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Suspicious activity', 'Area secured', 'Shift change'].map(
              (template) => (
                <TouchableOpacity
                  key={template}
                  style={styles.templatePill}
                  onPress={() => setMessage(template)}
                >
                  <Text style={styles.templateText}>{template}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        <View style={styles.recipientsCard}>
          <Text style={styles.recipientsIcon}>👥</Text>
          <View style={styles.recipientsInfo}>
            <Text style={styles.recipientsTitle}>
              Broadcasting to 24 active users
            </Text>
            <Text style={styles.recipientsSubtitle}>
              All users in Downtown District - Zone 3
            </Text>
          </View>
        </View>

        <View style={styles.priorityCard}>
          <View style={styles.priorityLeft}>
            <Text style={styles.priorityTitle}>High Priority Alert</Text>
            <Text style={styles.prioritySubtitle}>
              Sends as push notification with sound
            </Text>
          </View>
          <Switch
            value={highPriority}
            onValueChange={setHighPriority}
            trackColor={{
              false: colors.mediumGray,
              true: colors.emergencyRed,
            }}
            thumbColor={colors.white}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="SEND BROADCAST"
          onPress={handleSend}
          variant="primary"
          style={styles.sendButton}
          icon={<Text style={styles.sendIcon}>✈️</Text>}
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.footerCancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  cancelText: {
    ...typography.secondary,
    color: colors.primary,
  },
  title: {
    ...typography.sectionHeader,
  },
  infoIcon: {
    fontSize: 20,
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  infoBanner: {
    backgroundColor: colors.badgeBlueBg,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.secondary,
    color: colors.secondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.lightText,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  alertTypePill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.borderGray,
    marginRight: spacing.sm,
  },
  selectedPill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  alertTypeText: {
    ...typography.buttonLarge,
    color: colors.darkText,
  },
  selectedPillText: {
    color: colors.white,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    padding: spacing.base,
    minHeight: 180,
    ...typography.body,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  templatePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderGray,
    marginRight: spacing.sm,
  },
  templateText: {
    ...typography.secondary,
  },
  recipientsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
    marginBottom: spacing.md,
  },
  recipientsIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  recipientsInfo: {
    flex: 1,
  },
  recipientsTitle: {
    ...typography.cardTitle,
    marginBottom: spacing.xs,
  },
  recipientsSubtitle: {
    ...typography.caption,
    color: colors.lightText,
  },
  priorityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  priorityLeft: {
    flex: 1,
  },
  priorityTitle: {
    ...typography.secondary,
    marginBottom: spacing.xs,
  },
  prioritySubtitle: {
    ...typography.caption,
    color: colors.lightText,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.borderGray,
  },
  sendButton: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  sendIcon: {
    fontSize: 18,
  },
  footerCancel: {
    ...typography.secondary,
    textAlign: 'center',
    color: colors.lightText,
  },
});

