import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../utils';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = spacing.base,
}) => {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
});














