import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../utils';

interface BadgeProps {
  text: string;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  color = colors.darkText,
  backgroundColor = colors.badgeBlueBg,
  size = 'small',
}) => {
  const sizeStyles = {
    small: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    medium: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    large: { paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  };

  return (
    <View style={[styles.badge, { backgroundColor }, sizeStyles[size]]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...typography.badge,
    fontWeight: '600',
  },
});













