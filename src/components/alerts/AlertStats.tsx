import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils';

interface AlertStatsProps {
  active: number;
  pending: number;
  resolved: number;
}

export const AlertStats: React.FC<AlertStatsProps> = ({
  active,
  pending,
  resolved,
}) => {
  return (
    <View style={styles.statsBar}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{active}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, styles.pendingValue]}>{pending}</Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, styles.resolvedValue]}>{resolved}</Text>
        <Text style={styles.statLabel}>Resolved</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsBar: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkText,
    letterSpacing: -0.3,
  },
  pendingValue: {
    color: colors.warningOrange,
  },
  resolvedValue: {
    color: colors.successGreen,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.lightText,
    marginTop: 2,
  },
});
