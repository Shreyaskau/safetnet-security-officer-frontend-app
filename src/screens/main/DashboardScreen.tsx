import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { AlertCard } from '../../components/alerts/AlertCard';
import { BottomTabNavigator } from '../../components/navigation/BottomTabNavigator';
import { useAlerts } from '../../hooks/useAlerts';
import { Alert } from '../../types/alert.types';
import { colors, typography, spacing } from '../../utils';
import { useAppSelector } from '../../redux/hooks';
import { alertService } from '../../api/services/alertService';

export const DashboardScreen = ({ navigation }: any) => {
  const { alerts } = useAlerts();
  const [recentLogs, setRecentLogs] = useState<Alert[]>([]);
  const officer = useAppSelector((state) => state.auth.officer);

  // Fetch logs when officer is available
  useEffect(() => {
    if (officer) {
      fetchRecentLogs();
    }
  }, [officer]);

  const fetchRecentLogs = async () => {
    if (!officer) return;
    try {
      const data = await alertService.getAlertLogs(officer.security_id, 'normal', officer.name);
      // Get 4 most recent logs
      const logs = data.data || [];
      setRecentLogs(logs.slice(0, 4));
    } catch (error: any) {
      // On error, set empty array instead of sample data
      setRecentLogs([]);
    }
  };

  const handleRespond = (alert: Alert) => {
    navigation.navigate('AlertResponse', { alert });
  };

  // Use sample data if no real alerts
      // Use only real data, no sample data fallback
      const displayAlerts = alerts;
      const displayLogs = recentLogs;

  const stats = {
    active: displayAlerts.filter((a) => a.status === 'pending' || a.status === 'accepted').length,
    pending: displayAlerts.filter((a) => a.status === 'pending').length,
    resolved: displayAlerts.filter((a) => a.status === 'completed').length,
  };

  // Get 4 most recent alerts
  const recentAlerts = displayAlerts.slice(0, 4);

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
        <Text style={styles.title}>HOME</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.pendingValue]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.resolvedValue]}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>
        </View>

        {/* Recent Alerts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.iconContainer, styles.alertsIconContainer]}>
                  <Text style={styles.sectionIcon}>🚨</Text>
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Recent Alerts</Text>
                  <Text style={styles.sectionSubtitle}>
                    {recentAlerts.length > 0 ? `${recentAlerts.length} active` : 'No alerts'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('Alerts')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Text style={styles.seeAllArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardsContainer}>
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onRespond={handleRespond} />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🛡️</Text>
                <Text style={styles.emptyText}>No recent alerts</Text>
                <Text style={styles.emptySubtext}>All clear! No new alerts at the moment.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Logs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.iconContainer, styles.logsIconContainer]}>
                  <Text style={styles.sectionIcon}>📋</Text>
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Recent Logs</Text>
                  <Text style={styles.sectionSubtitle}>
                    {recentLogs.length > 0 ? `${recentLogs.length} entries` : 'No logs'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('Logs')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Text style={styles.seeAllArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardsContainer}>
            {displayLogs.length > 0 ? (
              displayLogs.map((log) => (
                <AlertCard key={log.id} alert={log} onRespond={() => {}} />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>No recent logs</Text>
                <Text style={styles.emptySubtext}>Your activity history will appear here.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  statsSection: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  pendingValue: {
    color: colors.warningOrange,
  },
  resolvedValue: {
    color: colors.successGreen,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.lightText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeaderContainer: {
    backgroundColor: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  alertsIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  logsIconContainer: {
    backgroundColor: '#DBEAFE',
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.lightText,
    fontWeight: '400',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.lightGrayBg,
  },
  seeAllText: {
    ...typography.buttonSmall,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  seeAllArrow: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  cardsContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.lightGrayBg,
    borderRadius: 12,
    padding: spacing.xl,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkText,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.caption,
    fontSize: 13,
    color: colors.lightText,
    textAlign: 'center',
  },
});

// Export with bottom nav wrapper
export const DashboardScreenWithBottomNav = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1 }}>
      <DashboardScreen navigation={navigation} />
      <BottomTabNavigator />
    </View>
  );
};
