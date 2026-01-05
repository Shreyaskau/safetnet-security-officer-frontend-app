import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors: themeColors } = useTheme();

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    statsBar: {
      backgroundColor: themeColors.lightGrayBg,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: themeColors.text,
      letterSpacing: -0.3,
    },
    pendingValue: {
      color: themeColors.warningOrange, // Keep orange for pending
    },
    resolvedValue: {
      color: themeColors.successGreen, // Keep green for resolved
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '400',
      color: themeColors.lightText,
      marginTop: 2,
    },
  });

  return (
    <View style={dynamicStyles.statsBar}>
      <View style={styles.statItem}>
        <Text style={dynamicStyles.statValue}>{active}</Text>
        <Text style={dynamicStyles.statLabel}>Active</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[dynamicStyles.statValue, dynamicStyles.pendingValue]}>{pending}</Text>
        <Text style={dynamicStyles.statLabel}>Pending</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[dynamicStyles.statValue, dynamicStyles.resolvedValue]}>{resolved}</Text>
        <Text style={dynamicStyles.statLabel}>Resolved</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statItem: {
    alignItems: 'center',
  },
});
