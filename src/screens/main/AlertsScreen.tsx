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
import Icon from 'react-native-vector-icons/MaterialIcons';
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

export const AlertsScreen = ({ navigation, route }: any) => {
  const { alerts, allAlerts, refreshing, filter, refreshAlerts, changeFilter, deleteAlert, closeAlert } = useAlerts();
  const { socket } = useSocket();
  const { isOffline } = useNetworkStatus();

  // Handle route params to set initial filter (e.g., when navigating from Dashboard "See All" with filter param)
  React.useEffect(() => {
    if (route?.params?.filter) {
      changeFilter(route.params.filter);
    }
  }, [route?.params?.filter]);

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

  const handleDelete = async (alert: Alert) => {
    try {
      await deleteAlert(alert.id || alert.log_id);
    } catch (error: any) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleSolve = async (alert: Alert) => {
    try {
      const alertId = alert.log_id || alert.id;
      if (!alertId) {
        console.error('Alert ID not found');
        return;
      }
      await closeAlert(alertId, 'completed');
      // Alert status is updated immediately and will appear in "Completed" filter
      // The alert list will refresh automatically
      console.log('[AlertsScreen] Alert marked as completed, refreshing list...');
      // Optionally switch to "Completed" filter to show the solved alert
      // Uncomment the line below if you want to auto-switch to Completed filter after solving
      // changeFilter('completed');
    } catch (error: any) {
      console.error('Error solving alert:', error);
    }
  };

  // Use only real alerts, no sample data
  const displayAlerts = alerts;
  
  // Calculate stats from ALL alerts (not filtered) to show accurate counts
  // Handle both 'completed' and 'resolved' statuses (backend may use either)
  const allAlertsForStats = allAlerts || alerts;

  const stats = {
    active: allAlertsForStats.filter((a) => {
      if (!a || !a.status) return false;
      const status = String(a.status).toLowerCase();
      return status === 'pending' || status === 'accepted';
    }).length,
    pending: allAlertsForStats.filter((a) => a && a.status && String(a.status).toLowerCase() === 'pending').length,
    resolved: allAlertsForStats.filter((a) => {
      if (!a || !a.status) return false;
      const status = String(a.status).toLowerCase();
      return status === 'completed' || status === 'resolved';
    }).length,
  };

  const filters = [
    { key: 'all' as const, label: 'All Alerts' },
    { key: 'emergency' as const, label: 'Emergency' },
    { key: 'normal' as const, label: 'Accepted' },
    { key: 'pending' as const, label: 'Pending' },
    { key: 'completed' as const, label: 'Completed' },
  ];

  const emergencyCount = displayAlerts.filter((a) => a.priority === 'high').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            navigation.navigate('Settings');
          }}
        >
          <Icon name="settings" size={24} color={colors.darkText} />
        </TouchableOpacity>
        <Text style={styles.title}>ALERTS</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Icon name="search" size={24} color={colors.darkText} />
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
          <AlertCard alert={item} onRespond={handleRespond} onDelete={handleDelete} onSolve={handleSolve} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="notifications"
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
        icon="add"
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

