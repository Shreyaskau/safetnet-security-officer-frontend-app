import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AlertCard } from '../../components/alerts/AlertCard';
import { BottomTabNavigator } from '../../components/navigation/BottomTabNavigator';
import { useAlerts } from '../../hooks/useAlerts';
import { Alert } from '../../types/alert.types';
import { colors, typography, spacing } from '../../utils';
import { useTheme } from '../../contexts/ThemeContext';

export const DashboardScreen = ({ navigation }: any) => {
  const { colors: themeColors, effectiveTheme } = useTheme();
  const { alerts, allAlerts } = useAlerts();

  const handleRespond = (alert: Alert) => {
    navigation.navigate('AlertResponse', { alert });
  };

  // Use only real data, no sample data fallback
  const displayAlerts = alerts;

  // Use allAlerts for stats counts (not filtered alerts) to show accurate totals
  // Handle both 'completed' and 'resolved' statuses (backend may use either)
  const stats = {
    active: allAlerts.filter((a) => {
      if (!a || !a.status) return false;
      const status = String(a.status).toLowerCase();
      return status === 'pending' || status === 'accepted';
    }).length,
    pending: allAlerts.filter((a) => a && a.status && String(a.status).toLowerCase() === 'pending').length,
    resolved: allAlerts.filter((a) => {
      if (!a || !a.status) return false;
      const status = String(a.status).toLowerCase();
      return status === 'completed' || status === 'resolved';
    }).length,
  };

  // Get 4 most recent alerts
  const recentAlerts = displayAlerts.slice(0, 4);

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      backgroundColor: themeColors.lightGrayBg,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    title: {
      ...typography.screenHeader,
      color: themeColors.text,
    },
    statsCard: {
      backgroundColor: themeColors.lightGrayBg,
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
      borderColor: themeColors.border,
    },
    statValue: {
      fontSize: 32,
      fontWeight: '800',
      color: themeColors.primary,
      letterSpacing: -0.5,
      marginBottom: spacing.xs,
    },
    statLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: themeColors.lightText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: themeColors.border,
      marginHorizontal: spacing.sm,
    },
    section: {
      marginTop: spacing.lg,
      backgroundColor: themeColors.lightGrayBg,
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
      backgroundColor: themeColors.lightGrayBg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    sectionTitle: {
      ...typography.sectionHeader,
      fontSize: 18,
      fontWeight: '700',
      color: themeColors.text,
      marginBottom: 2,
    },
    sectionSubtitle: {
      ...typography.caption,
      fontSize: 12,
      color: themeColors.lightText,
      fontWeight: '400',
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 20,
      backgroundColor: effectiveTheme === 'dark' ? themeColors.white : themeColors.lightGrayBg,
    },
    seeAllText: {
      ...typography.buttonSmall,
      color: themeColors.primary,
      fontSize: 14,
      fontWeight: '600',
      marginRight: 4,
    },
    seeAllArrow: {
      fontSize: 16,
      color: themeColors.primary,
      fontWeight: '600',
    },
    emptyCard: {
      backgroundColor: themeColors.lightGrayBg,
      borderRadius: 12,
      padding: spacing.xl,
      marginHorizontal: spacing.md,
      marginVertical: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border,
      borderStyle: 'dashed',
    },
    emptyText: {
      ...typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: spacing.xs,
    },
    emptySubtext: {
      ...typography.caption,
      fontSize: 13,
      color: themeColors.lightText,
      textAlign: 'center',
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
        <Text style={dynamicStyles.title}>HOME</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Icon name="search" size={24} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={dynamicStyles.statsCard}>
            <View style={styles.statItem}>
              <Text style={dynamicStyles.statValue}>{stats.active}</Text>
              <Text style={dynamicStyles.statLabel}>Active</Text>
            </View>
            <View style={dynamicStyles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[dynamicStyles.statValue, styles.pendingValue]}>{stats.pending}</Text>
              <Text style={dynamicStyles.statLabel}>Pending</Text>
            </View>
            <View style={dynamicStyles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[dynamicStyles.statValue, styles.resolvedValue]}>{stats.resolved}</Text>
              <Text style={dynamicStyles.statLabel}>Resolved</Text>
            </View>
          </View>
        </View>

        {/* Recent Alerts Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeaderContainer}>
            <View style={dynamicStyles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.iconContainer, styles.alertsIconContainer]}>
                  <Icon name="notifications" size={24} color={themeColors.emergencyRed} />
                </View>
                <View>
                  <Text style={dynamicStyles.sectionTitle}>Recent Alerts</Text>
                  <Text style={dynamicStyles.sectionSubtitle}>
                    {recentAlerts.length > 0 ? `${recentAlerts.length} active` : 'No alerts'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={dynamicStyles.seeAllButton}
                onPress={() => navigation.navigate('Alerts')}
                activeOpacity={0.7}
              >
                <Text style={dynamicStyles.seeAllText}>See All</Text>
                <Text style={dynamicStyles.seeAllArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardsContainer}>
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} onRespond={handleRespond} />
              ))
            ) : (
              <View style={dynamicStyles.emptyCard}>
                <Text style={styles.emptyIcon}>🛡️</Text>
                <Text style={dynamicStyles.emptyText}>No recent alerts</Text>
                <Text style={dynamicStyles.emptySubtext}>All clear! No new alerts at the moment.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  pendingValue: {
    color: colors.warningOrange, // Keep alert colors static
  },
  resolvedValue: {
    color: colors.successGreen, // Keep alert colors static
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
    backgroundColor: '#FEE2E2', // Keep icon background static for now
  },
  sectionIcon: {
    fontSize: 24,
  },
  cardsContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.5,
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
