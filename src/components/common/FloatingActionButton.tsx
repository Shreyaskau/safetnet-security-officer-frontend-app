import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../utils';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  size?: number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = '+',
  size = 56,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.icon, { fontSize: size * 0.4 }]}>{icon}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    right: spacing.base,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    color: colors.white,
    fontWeight: 'bold',
  },
});












