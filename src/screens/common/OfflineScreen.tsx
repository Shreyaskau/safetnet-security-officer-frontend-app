import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from '../../components/common/Button';
import { colors, typography, spacing } from '../../utils';

export const OfflineScreen = ({ navigation, route }: any) => {
  const onRetry = (route && route.params && route.params.onRetry) ? route.params.onRetry : (() => {
    if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    }
  });
  const onHelp = (route && route.params) ? route.params.onHelp : undefined;
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="wifi-off" size={100} color={colors.mediumGray} />
          <View style={styles.xIconContainer}>
            <Icon name="close" size={60} color={colors.emergencyRed} />
          </View>
        </View>

        <Text style={styles.title}>You're Offline</Text>

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>DISCONNECTED</Text>
        </View>

        <Text style={styles.description}>
          Connect to the internet to receive emergency alerts.
        </Text>

        <View style={styles.checklist}>
          <View style={styles.checklistItem}>
            <View style={styles.checkbox} />
            <Text style={styles.checklistText}>Check WiFi</Text>
          </View>
          <View style={styles.checklistItem}>
            <View style={styles.checkbox} />
            <Text style={styles.checklistText}>Enable mobile data</Text>
          </View>
          <View style={styles.checklistItem}>
            <View style={styles.checkbox} />
            <Text style={styles.checklistText}>Check airplane mode</Text>
          </View>
        </View>

        <Button
          title="RETRY"
          onPress={onRetry}
          variant="primary"
          style={styles.retryButton}
          icon={<Icon name="refresh" size={18} color={colors.white} />}
        />

        {onHelp && (
          <TouchableOpacity onPress={onHelp} style={styles.helpLink}>
            <Text style={styles.helpText}>Connection Issues?</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  xIconContainer: {
    position: 'absolute',
    top: '30%',
    left: '30%',
  },
  title: {
    ...typography.screenHeader,
    fontSize: 22,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.badgeRedBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.emergencyRed,
    marginRight: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.emergencyRed,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  description: {
    ...typography.body,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  checklist: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderGray,
    marginRight: spacing.md,
  },
  checklistText: {
    ...typography.body,
    color: colors.darkText,
  },
  retryButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  helpLink: {
    paddingVertical: spacing.sm,
  },
  helpText: {
    ...typography.secondary,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

