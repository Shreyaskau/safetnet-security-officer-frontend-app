import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../utils';

interface AlertFilterProps {
  selectedFilter: 'all' | 'emergency' | 'normal' | 'pending' | 'completed';
  onFilterChange: (filter: 'all' | 'emergency' | 'normal' | 'pending' | 'completed') => void;
  counts?: {
    all?: number;
    emergency?: number;
    normal?: number;
    pending?: number;
    completed?: number;
  };
}

export const AlertFilter: React.FC<AlertFilterProps> = ({
  selectedFilter,
  onFilterChange,
  counts,
}) => {
  const filters = [
    { key: 'all' as const, label: 'All Alerts' },
    { key: 'emergency' as const, label: 'Emergency' },
    { key: 'normal' as const, label: 'Normal' },
    { key: 'pending' as const, label: 'Pending' },
    { key: 'completed' as const, label: 'Completed' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter.key;
          const count = counts && counts[filter.key] ? counts[filter.key] : undefined;
          const showDot = filter.key === 'emergency' && count && count > 0;

          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterItem, isSelected && styles.selectedFilter]}
              onPress={() => onFilterChange(filter.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.selectedFilterText,
                ]}
              >
                {filter.label}
              </Text>
              {showDot && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  filterItem: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    position: 'relative',
  },
  selectedFilter: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  filterText: {
    ...typography.secondary,
    color: colors.darkText,
  },
  selectedFilterText: {
    color: colors.primary,
    fontWeight: '600',
  },
  dot: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emergencyRed,
  },
});












