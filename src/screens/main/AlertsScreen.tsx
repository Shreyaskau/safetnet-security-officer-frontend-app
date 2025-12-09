import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AlertCard } from '../../components/alerts/AlertCard';
import { AlertStats } from '../../components/alerts/AlertStats';
import { EmptyState } from '../../components/common/EmptyState';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { BottomTabNavigator } from '../../components/navigation/BottomTabNavigator';
import { useSocket } from '../../hooks/useSocket';
import { useAlerts } from '../../hooks/useAlerts';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { Alert } from '../../types/alert.types';
import { colors, typography, spacing } from '../../utils';
import { getSampleAlerts } from '../../utils/sampleData';

export const AlertsScreen = ({ navigation }: any) => {
  const { alerts, refreshing, filter, refreshAlerts, changeFilter } = useAlerts();
  const { socket } = useSocket();
  const { isOffline } = useNetworkStatus();

  React.useEffect(() => {
    if (isOffline) {
      navigation.navigate('Offline', {
        onRetry: () => {
          navigation.goBack();
          refreshAlerts();
        },
      });
    }
  }, [isOffline, navigation, refreshAlerts]);

  const handleRespond = (alert: Alert) => {
    navigation.navigate('AlertResponse', { alert });
  };

  // Use sample data if no real alerts
  const displayAlerts = alerts.length > 0 ? alerts : getSampleAlerts();

  const stats = {
    active: displayAlerts.filter((a) => a.status === 'pending' || a.status === 'accepted').length,
    pending: displayAlerts.filter((a) => a.status === 'pending').length,
    resolved: displayAlerts.filter((a) => a.status === 'completed').length,
  };

  const filters = [
    { key: 'all' as const, label: 'All Alerts' },
    { key: 'emergency' as const, label: 'Emergency' },
    { key: 'normal' as const, label: 'Normal' },
    { key: 'pending' as const, label: 'Pending' },
    { key: 'completed' as const, label: 'Completed' },
  ];

  const emergencyCount = displayAlerts.filter((a) => a.alert_type === 'emergency').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            navigation.navigate('Settings');
          }}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ALERTS</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabs}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
        >
          {filters.map((filterItem) => {
            const isActive = filter === filterItem.key;
            const showBadge = filterItem.key === 'emergency' && emergencyCount > 0;

            return (
              <TouchableOpacity
                key={filterItem.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => changeFilter(filterItem.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {filterItem.label}
                </Text>
                {showBadge && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{emergencyCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={displayAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard alert={item} onRespond={handleRespond} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="🚨"
            title="No Active Alerts"
            description="All clear! No new alerts at the moment."
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshAlerts} />
        }
      />

      <AlertStats
        active={stats.active}
        pending={stats.pending}
        resolved={stats.resolved}
      />

      <FloatingActionButton
        onPress={() => navigation.navigate('Broadcast')}
        icon="+"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.darkText,
  },
  title: {
    ...typography.screenHeader,
    color: colors.darkText,
  },
  bellIcon: {
    fontSize: 24,
    color: colors.darkText,
  },
  filterTabs: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTabsContent: {
    paddingHorizontal: spacing.md,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.lightGrayBg,
    marginRight: spacing.sm,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.buttonSmall,
    color: colors.darkText,
  },
  filterTabTextActive: {
    color: colors.white,
  },
  filterBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.emergencyRed,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});

