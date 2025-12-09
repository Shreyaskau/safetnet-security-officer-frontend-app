import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../utils';

interface EmptyStateProps {
  icon: string | React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      {typeof icon === 'string' ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : (
        icon
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.actionButton}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.screenHeader,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.lightText,
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: spacing.lg,
  },
  actionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionText: {
    ...typography.secondary,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});












