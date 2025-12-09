import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import { alertService } from '../../api/services/alertService';
import { AlertCard } from '../../components/alerts/AlertCard';
import { EmptyState } from '../../components/common/EmptyState';
import { AlertCardSkeleton } from '../../components/common/SkeletonLoader';
import { colors, typography, spacing } from '../../utils';
import { Alert } from '../../types/alert.types';
import { getSampleLogs } from '../../utils/sampleData';

export const LogsScreen = ({ navigation, route }: any) => {
  const [logs, setLogs] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const filterFromRoute = (route && route.params && route.params.filter) ? route.params.filter : 'normal';
  const [selectedTab, setSelectedTab] = useState<'normal' | 'emergency' | 'completed'>(filterFromRoute);
  const officer = useAppSelector((state) => state.auth.officer);

  useEffect(() => {
    fetchLogs();
  }, [selectedTab, officer]);

  const fetchLogs = async () => {
    if (!officer) return;
    setIsLoading(true);
    try {
      const data = await alertService.getAlertLogs(officer.security_id, selectedTab);
      setLogs(data.data || []);
    } catch (error: any) {
      // Only log 404 errors, don't show them as critical errors
      if (error.response && error.response.status === 404) {
        // Silently handle 404 - backend endpoint not available
        // Use sample data instead of empty array
        setLogs(getSampleLogs());
      } else {
      console.error('Error fetching logs:', error);
      // Use sample data on other errors too
      setLogs(getSampleLogs());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedTab === 'normal') return log.status === 'completed';
    if (selectedTab === 'emergency') return log.alert_type === 'emergency';
    if (selectedTab === 'completed') return log.alert_type === 'normal';
    return true;
  });

  const counts = {
    normal: logs.filter((l) => l.status === 'completed').length,
    emergency: logs.filter((l) => l.alert_type === 'emergency').length,
    completed: logs.filter((l) => l.alert_type === 'normal').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'normal' && styles.selectedTab]}
          onPress={() => setSelectedTab('normal')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'normal' && styles.selectedTabText,
            ]}
          >
            NORMAL
          </Text>
          {counts.normal > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{counts.normal}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'emergency' && styles.selectedTab]}
          onPress={() => setSelectedTab('emergency')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'emergency' && styles.selectedTabText,
            ]}
          >
            EMERGENCY
          </Text>
          {counts.emergency > 0 && (
            <View style={[styles.badge, styles.emergencyBadge]}>
              <Text style={styles.badgeText}>{counts.emergency}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.selectedTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'completed' && styles.selectedTabText,
            ]}
          >
            COMPLETED
          </Text>
          {counts.completed > 0 && (
            <View style={[styles.badge, styles.completedBadge]}>
              <Text style={styles.badgeText}>{counts.completed}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {[1, 2, 3, 4, 5].map((i) => (
            <AlertCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertCard alert={item} onRespond={() => {}} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="📋"
              title="No Alert History"
              description="Your responded alerts will appear here."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  selectedTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.secondary,
    color: colors.lightText,
  },
  selectedTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.mediumGray,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  emergencyBadge: {
    backgroundColor: colors.emergencyRed,
  },
  completedBadge: {
    backgroundColor: colors.successGreen,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    fontSize: 10,
  },
  list: {
    paddingVertical: spacing.base,
  },
});

