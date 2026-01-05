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
import { useTheme } from '../../contexts/ThemeContext';

export const AlertsScreen = ({ navigation, route }: any) => {
  const { colors: themeColors } = useTheme();
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

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      backgroundColor: themeColors.lightGrayBg,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    title: {
      ...typography.screenHeader,
      color: themeColors.text,
    },
    filterTabs: {
      backgroundColor: themeColors.lightGrayBg,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    filterTab: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.xs,
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    filterTabActive: {
      backgroundColor: themeColors.primary,
    },
    filterTabText: {
      ...typography.buttonSmall,
      color: themeColors.lightText,
      fontSize: 14,
      fontWeight: '500',
    },
    filterTabTextActive: {
      color: themeColors.white,
      fontWeight: '600',
    },
    list: {
      padding: spacing.md,
      paddingBottom: 100, // Space for FAB and stats
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity 
          onPress={() => {
            navigation.navigate('Settings');
          }}
        >
          <Icon name="settings" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>ALERTS</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Icon name="search" size={24} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.filterTabs}>
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
                style={[dynamicStyles.filterTab, isActive && dynamicStyles.filterTabActive]}
                onPress={() => changeFilter(filterItem.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    dynamicStyles.filterTabText,
                    isActive && dynamicStyles.filterTabTextActive,
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
        contentContainerStyle={dynamicStyles.list}
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
  filterTabsContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  filterBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.emergencyRed, // Keep static for emergency badge
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
});

