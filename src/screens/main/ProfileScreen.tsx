import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { LogoutModal } from '../../components/modals/LogoutModal';
import { colors, shadows } from '../../utils';
import { PerformanceChart } from '../../components/charts/PerformanceChart';

export const ProfileScreen = ({ navigation }: any) => {
  const officer = useAppSelector((state) => state.auth.officer);
  const dispatch = useAppDispatch();
  const { logout: logoutUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    if (officer) {
      await logoutUser(officer.security_id, 'security');
    }
    dispatch(logout());
    setShowLogoutModal(false);
  };

  // Format response time from minutes to readable format
  const formatResponseTime = (minutes: number | undefined): string => {
    if (!minutes) return 'N/A';
    if (minutes < 1) {
      return `${Math.round(minutes * 60)}s`;
    }
    if (minutes < 60) {
      return `${minutes.toFixed(1)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Format number with commas
  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  // Format percentage
  const formatPercentage = (num: number | undefined): string => {
    if (!num) return '0%';
    return `${num.toFixed(1)}%`;
  };

  // Format score (out of 100 or 10)
  const formatScore = (score: number | undefined, max: number = 100): string => {
    if (!score) return '0';
    return `${score.toFixed(0)}/${max}`;
  };

  // Get sample stats if not available
  const getSampleStats = () => {
    return {
      total_responses: (officer && officer.stats && officer.stats.total_responses) ? officer.stats.total_responses : 156,
      avg_response_time: (officer && officer.stats && officer.stats.avg_response_time) ? officer.stats.avg_response_time : 3.2,
      active_hours: (officer && officer.stats && officer.stats.active_hours) ? officer.stats.active_hours : 240,
      area_coverage: (officer && officer.stats && officer.stats.area_coverage) ? officer.stats.area_coverage : 8.5,
      rating: (officer && officer.stats && officer.stats.rating) ? officer.stats.rating : 4.8,
    };
  };

  const sampleStats = getSampleStats();

  // Get sample scores if stats don't exist
  const getScores = () => {
    const rating = sampleStats.rating;
    // Convert rating (out of 5) to score (out of 100)
    const overallScore = Math.round(rating * 20);
    
    // Calculate other scores based on stats
    const responseTime = sampleStats.avg_response_time;
    const totalResponses = sampleStats.total_responses;
    const areaCoverage = sampleStats.area_coverage;
    
    // Performance: Based on total responses (higher is better, max 100)
    const performance = Math.min(90 + Math.floor(totalResponses / 10), 100);
    
    // Efficiency: Based on response time (lower is better, max 100)
    const efficiency = Math.max(70, 100 - Math.floor(responseTime * 5));
    
    // Reliability: Based on rating (direct conversion)
    const reliability = overallScore;
    
    // Response Rate: Based on area coverage and responses
    const response = Math.min(85 + Math.floor(areaCoverage * 2), 100);
    
    return {
      overall: overallScore,
      performance: performance,
      efficiency: efficiency,
      reliability: reliability,
      response: response,
    };
  };

  const scores = getScores();

  const stats = [
    {
      label: 'Alerts Responded',
      value: formatNumber(sampleStats.total_responses),
      icon: '🔔',
      color: colors.primary,
      cardColor: 'white',
    },
    {
      label: 'Response Time',
      value: formatResponseTime(sampleStats.avg_response_time),
      icon: '⏱️',
      color: colors.successGreen,
      cardColor: 'green',
    },
    {
      label: 'Active Hours',
      value: formatNumber(sampleStats.active_hours),
      icon: '🕐',
      color: colors.warningOrange,
      cardColor: 'orange',
    },
    {
      label: 'Area Coverage',
      value: formatPercentage(sampleStats.area_coverage),
      icon: '🎯',
      color: colors.infoBlue,
      cardColor: 'blue',
    },
  ];

  const getCardStyle = (cardColor: string) => {
    switch (cardColor) {
      case 'blue':
        return styles.statCardBlue;
      case 'green':
        return styles.statCardGreen;
      case 'orange':
        return styles.statCardOrange;
      case 'purple':
        return styles.statCardPurple;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.secondary} />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.profileImageContainer}>
            {officer && officer.user_image ? (
              <Image
                source={{ uri: officer.user_image }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={styles.profileImageText}>
                  {officer && officer.name && typeof officer.name === 'string' ? officer.name.charAt(0).toUpperCase() : 'O'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.officerName}>{officer && officer.name ? officer.name : 'Officer'}</Text>
          <Text style={styles.badgeNumber}>#{officer && officer.security_id ? officer.security_id : 'N/A'}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{officer && officer.security_role ? officer.security_role : 'Security Officer'}</Text>
          </View>

          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>
                {formatNumber(sampleStats.total_responses)}
              </Text>
              <Text style={styles.quickStatLabel}>Alerts</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>
                {formatResponseTime(sampleStats.avg_response_time)}
              </Text>
              <Text style={styles.quickStatLabel}>Avg Time</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>
                {formatPercentage(sampleStats.area_coverage)}
              </Text>
              <Text style={styles.quickStatLabel}>Coverage</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View
                key={index}
                style={[styles.statCard, getCardStyle(stat.cardColor)]}
              >
                {index === 0 && (
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>+12%</Text>
                  </View>
                )}
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <View style={styles.statContent}>
                  <Text style={styles.statValue} numberOfLines={1}>{stat.value}</Text>
                  <Text style={styles.statLabel} numberOfLines={2}>{stat.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Performance Scores Section */}
          <View style={styles.scoresSection}>
            <View style={styles.scoresHeader}>
              <View style={styles.scoresHeaderLeft}>
                <View style={styles.scoresHeaderIconContainer}>
                  <Text style={styles.scoresHeaderIcon}>🏆</Text>
                </View>
                <View style={styles.scoresHeaderText}>
                  <Text style={styles.sectionHeader}>PERFORMANCE SCORES</Text>
                  <Text style={styles.scoresSubtitle}>Your overall performance metrics</Text>
                </View>
              </View>
            </View>

            {/* Performance Chart */}
            <PerformanceChart scores={scores} />
          </View>

          {/* Contact Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionHeader}>CONTACT DETAILS</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📧</Text>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{officer && officer.email_id ? officer.email_id : 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{officer && officer.mobile ? officer.mobile : 'N/A'}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoIcon}>🆔</Text>
              <Text style={styles.infoLabel}>Badge ID</Text>
              <Text style={styles.infoValue}>#{officer && officer.security_id ? officer.security_id : 'N/A'}</Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  headerSection: {
    backgroundColor: colors.secondary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 0,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
  },
  profileImagePlaceholder: {
    backgroundColor: colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
  },
  editButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  editIcon: {
    fontSize: 18,
  },
  officerName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  badgeNumber: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  quickStatItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    opacity: 0.95,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.white,
    opacity: 0.75,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 0,
    paddingTop: 0,
    flexGrow: 1,
  },
  contentSection: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
    paddingBottom: 0,
    minHeight: 'auto',
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    ...shadows.sm,
    position: 'relative',
    minHeight: 140,
  },
  statCardBlue: {
    backgroundColor: '#EFF6FF', // Light blue tint
  },
  statCardGreen: {
    backgroundColor: '#ECFDF5', // Light green tint
  },
  statCardOrange: {
    backgroundColor: '#FFF7ED', // Light orange tint
  },
  statCardPurple: {
    backgroundColor: '#F5F3FF', // Light purple tint
  },
  statIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 28,
    opacity: 0.8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.darkText,
    letterSpacing: -0.5,
    marginTop: 8,
    marginBottom: 8,
    maxWidth: '85%',
    flexShrink: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.lightText,
    marginTop: 4,
    lineHeight: 16,
  },
  statBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.badgeGreenBg,
  },
  statBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.successGreen,
  },
  statContent: {
    marginTop: 32,
    flex: 1,
    justifyContent: 'flex-end',
  },
  scoresSection: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'visible', // Allow labels to be visible
  },
  scoresHeader: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
  },
  scoresHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoresHeaderIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...shadows.sm,
  },
  scoresHeaderIcon: {
    fontSize: 32,
  },
  scoresHeaderText: {
    flex: 1,
  },
  scoresSubtitle: {
    fontSize: 13,
    color: colors.lightText,
    marginTop: 4,
    fontWeight: '400',
  },
  infoSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    ...shadows.sm,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.lightText,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    width: 20,
    height: 20,
    fontSize: 20,
    color: colors.primary,
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.lightText,
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.darkText,
  },
  logoutButton: {
    height: 48,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.emergencyRed,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.emergencyRed,
    letterSpacing: 0.5,
  },
});
