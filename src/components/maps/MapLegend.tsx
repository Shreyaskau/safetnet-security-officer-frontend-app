import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../utils';

interface LegendItem {
  icon: string;
  label: string;
  color?: string;
}

interface MapLegendProps {
  items: LegendItem[];
}

export const MapLegend: React.FC<MapLegendProps> = ({ items }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Legend</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.base,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 150,
  },
  title: {
    ...typography.cardTitle,
    marginBottom: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  label: {
    ...typography.body,
    fontSize: 14,
  },
});












