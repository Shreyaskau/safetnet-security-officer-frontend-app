import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout, updateOfficerProfile } from '../../redux/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { LogoutModal } from '../../components/modals/LogoutModal';
import { colors, shadows } from '../../utils';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { profileService } from '../../api/services/profileService';
import { geofenceService } from '../../api/services/geofenceService';
import { useTheme } from '../../contexts/ThemeContext';

export const ProfileScreen = ({ navigation }: any) => {
  const { colors: themeColors, effectiveTheme } = useTheme();
  const officer = useAppSelector((state) => state.auth.officer);
  const dispatch = useAppDispatch();
  const { logout: logoutUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geofenceName, setGeofenceName] = useState<string>('');

  // Function to fetch profile data
  const fetchProfileData = useCallback(async () => {
    if (!officer || !officer.security_id) {
      setIsLoading(false);
      if (officer) {
        setProfileData(officer);
      }
      return;
    }

    try {
      setIsLoading(true);
      console.log('[ProfileScreen] Fetching profile data for:', officer.security_id);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 15000);
      });
      
      // Fetch profile from API with timeout
      const profile: any = await Promise.race([
        profileService.getProfile(officer.security_id),
        timeoutPromise
      ]);
      console.log('[ProfileScreen] Profile data received:', JSON.stringify(profile, null, 2));
      
      // Extract phone number from various possible backend fields
      // Check all possible locations including nested user objects
      // ES5-compatible: no optional chaining
      const userObj = profile.user;
      const securityOfficerObj = profile.security_officer;
      const officerObj = profile.officer;
      
      // Helper function to check if a string is a phone number (not an email)
      const isValidPhoneNumber = (value: any): boolean => {
        if (!value || typeof value !== 'string') return false;
        const trimmed = value.trim();
        // Check if it's an email (contains @)
        if (trimmed.includes('@')) return false;
        // Check if it contains at least one digit
        if (!/\d/.test(trimmed)) return false;
        // Basic phone number validation (at least 6 digits, may contain +, -, spaces, parentheses)
        return /^[\d\s\+\-\(\)]{6,}$/.test(trimmed);
      };
      
      const phoneNumber = 
        // Direct profile fields (validate they're actually phone numbers, not emails)
        (profile.mobile && isValidPhoneNumber(profile.mobile) && profile.mobile) || 
        (profile.phone && isValidPhoneNumber(profile.phone) && profile.phone) || 
        (profile.officer_phone && isValidPhoneNumber(profile.officer_phone) && profile.officer_phone) || 
        (profile.phone_number && isValidPhoneNumber(profile.phone_number) && profile.phone_number) ||
        (profile.contact_number && isValidPhoneNumber(profile.contact_number) && profile.contact_number) ||
        (profile.contact_phone && isValidPhoneNumber(profile.contact_phone) && profile.contact_phone) ||
        (profile.phone_no && isValidPhoneNumber(profile.phone_no) && profile.phone_no) ||
        (profile.contact && isValidPhoneNumber(profile.contact) && profile.contact) ||
        // Nested user object fields (common in Django REST Framework)
        (userObj && userObj.mobile && isValidPhoneNumber(userObj.mobile) && userObj.mobile) ||
        (userObj && userObj.phone && isValidPhoneNumber(userObj.phone) && userObj.phone) ||
        (userObj && userObj.phone_number && isValidPhoneNumber(userObj.phone_number) && userObj.phone_number) ||
        (userObj && userObj.contact_number && isValidPhoneNumber(userObj.contact_number) && userObj.contact_number) ||
        // SecurityOfficer model fields (if nested)
        (securityOfficerObj && securityOfficerObj.mobile && isValidPhoneNumber(securityOfficerObj.mobile) && securityOfficerObj.mobile) ||
        (securityOfficerObj && securityOfficerObj.phone && isValidPhoneNumber(securityOfficerObj.phone) && securityOfficerObj.phone) ||
        // Officer profile fields
        (officerObj && officerObj.mobile && isValidPhoneNumber(officerObj.mobile) && officerObj.mobile) ||
        (officerObj && officerObj.phone && isValidPhoneNumber(officerObj.phone) && officerObj.phone) ||
        // Fallback to Redux officer data (only if it's a valid phone number)
        (officer.mobile && isValidPhoneNumber(officer.mobile) && officer.mobile) || 
        '';
      
      console.log('[ProfileScreen] Phone number extraction (comprehensive):', {
        'profile.mobile': profile.mobile,
        'profile.phone': profile.phone,
        'profile.officer_phone': profile.officer_phone,
        'profile.officer_phone_is_email': profile.officer_phone && profile.officer_phone.includes('@'),
        'profile.phone_number': profile.phone_number,
        'profile.contact_number': profile.contact_number,
        'profile.user.mobile': userObj && userObj.mobile ? userObj.mobile : undefined,
        'profile.user.phone': userObj && userObj.phone ? userObj.phone : undefined,
        'profile.security_officer.mobile': securityOfficerObj && securityOfficerObj.mobile ? securityOfficerObj.mobile : undefined,
        'profile.officer.mobile': officerObj && officerObj.mobile ? officerObj.mobile : undefined,
        'officer.mobile (Redux)': officer.mobile,
        'extracted_phone': phoneNumber,
        'profile_keys': profile ? Object.keys(profile) : [],
        'profile.user_keys': userObj ? Object.keys(userObj) : 'no user object',
        'NOTE': 'officer_phone contains email, not phone number. User table data not included in profile response.',
      });
      
      // Merge with existing officer data
      const fullProfileData = {
        ...officer,
        ...profile,
        // Map backend response fields to our format
        name: profile.officer_name || 
              profile.name || 
              (profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}`.trim() : null) ||
              profile.first_name ||
              profile.username ||
              officer.name,
        email_id: profile.email_id || profile.email || profile.officer_email || officer.email_id,
        mobile: phoneNumber, // Use extracted phone number
        security_role: profile.security_role || profile.role || officer.security_role,
        badge_number: profile.badge_number || profile.badge_id || officer.badge_number,
        shift_schedule: profile.shift_schedule || profile.shift || officer.shift_schedule,
        status: profile.status || (profile.on_duty ? 'active' : 'inactive') || officer.status,
      };
      
      setProfileData(fullProfileData);
      
      // Update Redux store with latest profile data
      dispatch(updateOfficerProfile({
        name: fullProfileData.name,
        email_id: fullProfileData.email_id,
        mobile: fullProfileData.mobile,
        badge_number: fullProfileData.badge_number,
        shift_schedule: fullProfileData.shift_schedule,
        status: fullProfileData.status,
      }));
      
      // Fetch geofence name if geofence_id is available
      // ES5-compatible: no optional chaining
      const assignedGeofence = profile.assigned_geofence;
      const geofenceId = (assignedGeofence && assignedGeofence.id ? assignedGeofence.id : null) || 
                        (profile.geofence_id && profile.geofence_id) || 
                        (profile.officer_geofence && profile.officer_geofence) ||
                        (officer.geofence_id && officer.geofence_id) ||
                        null;
      
      if (geofenceId) {
        try {
          const geofenceDetails = await geofenceService.getGeofenceDetails(String(geofenceId));
          setGeofenceName(geofenceDetails.name || String(geofenceId));
        } catch (geofenceError) {
          // If geofence_id is a name string, use it directly
          if (typeof geofenceId === 'string' && !geofenceId.match(/^\d+$/)) {
            setGeofenceName(geofenceId);
          } else {
            console.warn('[ProfileScreen] Could not fetch geofence name:', geofenceError);
          }
        }
      }
    } catch (error: any) {
      console.error('[ProfileScreen] Error fetching profile:', error);
      // Use existing officer data as fallback
      if (officer) {
        setProfileData(officer);
      }
      // Ensure loading is set to false even on error
      setIsLoading(false);
    } finally {
      // Double-check loading is set to false
      setIsLoading(false);
    }
  }, [officer, dispatch]);

  // Fetch profile data when component mounts or officer.security_id changes
  useEffect(() => {
    const securityId = officer && officer.security_id ? officer.security_id : null;
    if (securityId) {
      fetchProfileData();
    } else {
      setIsLoading(false);
      if (officer) {
        setProfileData(officer);
      }
    }
    // Only depend on security_id, not the entire fetchProfileData function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officer && officer.security_id ? officer.security_id : null]);

  // Refresh profile data when screen comes into focus (e.g., returning from UpdateProfileScreen)
  useFocusEffect(
    useCallback(() => {
      const securityId = officer && officer.security_id ? officer.security_id : null;
      if (securityId) {
        console.log('[ProfileScreen] Screen focused, refreshing profile data...');
        fetchProfileData();
      } else {
        setIsLoading(false);
        if (officer) {
          setProfileData(officer);
        }
      }
      // Only depend on security_id, not the entire fetchProfileData function
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [officer && officer.security_id ? officer.security_id : null])
  );

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

  // Sync profileData with Redux officer when Redux updates (e.g., after profile update)
  // This ensures immediate UI updates when profile is updated from UpdateProfileScreen
  useEffect(() => {
    if (officer && profileData) {
      // Check if Redux officer has updated fields that differ from profileData
      // Handle mobile field: check for both undefined and empty string differences
      const mobileChanged = officer.mobile !== undefined && 
                           (officer.mobile !== profileData.mobile || 
                            (officer.mobile === '' && profileData.mobile !== '') ||
                            (officer.mobile !== '' && profileData.mobile === ''));
      
      const hasUpdates = 
        (officer.name && officer.name !== profileData.name) ||
        (officer.email_id && officer.email_id !== profileData.email_id) ||
        mobileChanged ||
        (officer.badge_number !== undefined && officer.badge_number !== profileData.badge_number) ||
        (officer.shift_schedule !== undefined && officer.shift_schedule !== profileData.shift_schedule);
      
      if (hasUpdates) {
        console.log('[ProfileScreen] Redux officer updated, syncing profileData with:', {
          name: officer.name,
          email_id: officer.email_id,
          mobile: officer.mobile,
          badge_number: officer.badge_number,
          shift_schedule: officer.shift_schedule,
          'current_profileData.mobile': profileData.mobile,
          'mobileChanged': mobileChanged,
        });
        // Merge Redux updates into profileData for immediate UI update
        setProfileData({ 
          ...profileData, 
          name: officer.name || profileData.name,
          email_id: officer.email_id || profileData.email_id,
          mobile: officer.mobile !== undefined ? officer.mobile : profileData.mobile,
          badge_number: officer.badge_number !== undefined ? officer.badge_number : profileData.badge_number,
          shift_schedule: officer.shift_schedule !== undefined ? officer.shift_schedule : profileData.shift_schedule,
        });
      }
    } else if (officer && !profileData) {
      // If profileData not loaded yet, use officer from Redux
      console.log('[ProfileScreen] Setting profileData from Redux officer:', {
        mobile: officer.mobile,
      });
      setProfileData(officer);
    }
  }, [officer && officer.name ? officer.name : null, 
      officer && officer.email_id ? officer.email_id : null, 
      officer && officer.mobile !== undefined ? officer.mobile : null, 
      officer && officer.badge_number !== undefined ? officer.badge_number : null, 
      officer && officer.shift_schedule !== undefined ? officer.shift_schedule : null]);

  // Use profileData if available, otherwise fall back to officer from Redux
  // This ensures we always show the latest data (from API or Redux updates)
  // Merge both sources to ensure we have the latest phone number
  const displayOfficer = profileData ? {
    ...profileData,
    // Prioritize Redux officer.mobile if it exists and is different (more recent update)
    mobile: (officer && officer.mobile !== undefined && officer.mobile !== '') 
      ? officer.mobile 
      : (profileData.mobile || ''),
  } : officer;
  
  // Debug logging for phone number display
  console.log('[ProfileScreen] Display officer phone number:', {
    'profileData.mobile': profileData ? profileData.mobile : 'no profileData',
    'officer.mobile': officer ? officer.mobile : 'no officer',
    'displayOfficer.mobile': displayOfficer ? displayOfficer.mobile : 'no displayOfficer',
    'displayOfficer exists': !!displayOfficer,
  });

  // Get sample stats if not available
  const getSampleStats = () => {
    return {
      total_responses: (displayOfficer && displayOfficer.stats && displayOfficer.stats.total_responses) ? displayOfficer.stats.total_responses : 156,
      avg_response_time: (displayOfficer && displayOfficer.stats && displayOfficer.stats.avg_response_time) ? displayOfficer.stats.avg_response_time : 3.2,
      active_hours: (displayOfficer && displayOfficer.stats && displayOfficer.stats.active_hours) ? displayOfficer.stats.active_hours : 240,
      area_coverage: (displayOfficer && displayOfficer.stats && displayOfficer.stats.area_coverage) ? displayOfficer.stats.area_coverage : 8.5,
      rating: (displayOfficer && displayOfficer.stats && displayOfficer.stats.rating) ? displayOfficer.stats.rating : 4.8,
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
      cardColor: 'purple',
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
    // In dark mode, use dark backgrounds; in light mode, use light tinted backgrounds
    if (effectiveTheme === 'dark') {
      // Dark mode: use dark gray with slight tint - more subtle and fitting with dark theme
      switch (cardColor) {
        case 'white':
          return { backgroundColor: '#1A1A1A' }; // Slightly lighter than pure black, subtle
        case 'blue':
          return { backgroundColor: '#1A1F2E' }; // Darker blue-gray, more subtle
        case 'green':
          return { backgroundColor: '#1A2A1F' }; // Darker green-gray, more subtle
        case 'orange':
          return { backgroundColor: '#2A1F1A' }; // Darker orange-gray, more subtle
        case 'purple':
          return { backgroundColor: '#1F1A2A' }; // Darker purple-gray, more subtle
        default:
          return { backgroundColor: '#1A1A1A' }; // Subtle dark gray
      }
    } else {
      // Light mode: use light tinted backgrounds
      switch (cardColor) {
        case 'white':
          return styles.statCardBlue; // Use blue tint for white card in light mode
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
    }
  };

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: effectiveTheme === 'dark' ? themeColors.background : colors.secondary,
    },
    headerSection: {
      backgroundColor: effectiveTheme === 'dark' ? themeColors.background : colors.secondary,
      paddingTop: 60,
      paddingBottom: 40,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginTop: 0,
    },
    contentSection: {
      backgroundColor: themeColors.lightGrayBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -20,
      paddingTop: 24,
      paddingBottom: 0,
      minHeight: 'auto',
      flex: 1,
    },
    statCard: {
      width: '48%',
      backgroundColor: themeColors.lightGrayBg,
      borderRadius: 16,
      padding: 16,
      ...shadows.sm,
      position: 'relative',
      minHeight: 140,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
      color: themeColors.text,
      letterSpacing: -0.5,
      marginTop: 8,
      marginBottom: 8,
      maxWidth: '85%',
      flexShrink: 1,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '400',
      color: themeColors.lightText,
      marginTop: 4,
      lineHeight: 16,
    },
    scoresSection: {
      backgroundColor: themeColors.lightGrayBg,
      borderRadius: 20,
      padding: 20,
      marginHorizontal: 16,
      marginTop: 16,
      ...shadows.lg,
      borderWidth: 1,
      borderColor: themeColors.border,
      overflow: 'visible',
    },
    infoSection: {
      backgroundColor: themeColors.lightGrayBg,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 16,
      ...shadows.sm,
    },
    sectionHeader: {
      fontSize: 12,
      fontWeight: '600',
      color: themeColors.lightText,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 16,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '400',
      color: themeColors.text,
      flex: 1,
      textAlign: 'right',
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: themeColors.lightText,
      marginLeft: 12,
      minWidth: 80,
    },
    scoresSubtitle: {
      fontSize: 13,
      color: themeColors.lightText,
      marginTop: 4,
      fontWeight: '400',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: themeColors.text,
    },
  });

  if (isLoading) {
    return (
      <View style={[dynamicStyles.container, dynamicStyles.loadingContainer]}>
        <StatusBar barStyle={effectiveTheme === 'dark' ? 'light-content' : 'light-content'} backgroundColor={effectiveTheme === 'dark' ? themeColors.background : colors.secondary} />
        <ActivityIndicator size="large" color={effectiveTheme === 'dark' ? themeColors.primary : colors.white} />
        <Text style={dynamicStyles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <StatusBar barStyle={effectiveTheme === 'dark' ? 'light-content' : 'light-content'} backgroundColor={effectiveTheme === 'dark' ? themeColors.background : colors.secondary} />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={dynamicStyles.headerSection}>
          <View style={styles.profileImageContainer}>
            {displayOfficer && displayOfficer.user_image ? (
              <Image
                source={{ uri: displayOfficer.user_image }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Text style={[styles.profileImageText, { color: effectiveTheme === 'dark' ? themeColors.text : colors.white }]}>
                  {displayOfficer && displayOfficer.name && typeof displayOfficer.name === 'string' ? displayOfficer.name.charAt(0).toUpperCase() : 'O'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={[styles.editButton, { backgroundColor: effectiveTheme === 'dark' ? themeColors.lightGrayBg : colors.white }]}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.officerName, { color: effectiveTheme === 'dark' ? themeColors.text : colors.white }]}>{displayOfficer && displayOfficer.name ? displayOfficer.name : 'Officer'}</Text>
          <Text style={[styles.badgeNumber, { color: effectiveTheme === 'dark' ? themeColors.lightText : colors.white }]}>#{displayOfficer && displayOfficer.security_id ? displayOfficer.security_id : 'N/A'}</Text>

          <View style={[styles.roleBadge, { backgroundColor: effectiveTheme === 'dark' ? themeColors.lightGrayBg : 'rgba(255, 255, 255, 0.2)' }]}>
            <Text style={[styles.roleText, { color: effectiveTheme === 'dark' ? themeColors.text : colors.white }]}>
              {displayOfficer && displayOfficer.security_role 
                ? displayOfficer.security_role.charAt(0).toUpperCase() + displayOfficer.security_role.slice(1)
                : 'Security Officer'}
            </Text>
          </View>

          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: effectiveTheme === 'dark' ? themeColors.text : colors.white }]}>
                {formatNumber(sampleStats.total_responses)}
              </Text>
              <Text style={[styles.quickStatLabel, { color: effectiveTheme === 'dark' ? themeColors.lightText : colors.white }]}>Alerts</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: effectiveTheme === 'dark' ? themeColors.text : colors.white }]}>
                {formatResponseTime(sampleStats.avg_response_time)}
              </Text>
              <Text style={[styles.quickStatLabel, { color: effectiveTheme === 'dark' ? themeColors.lightText : colors.white }]}>Avg Time</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: effectiveTheme === 'dark' ? themeColors.text : colors.white }]}>
                {formatPercentage(sampleStats.area_coverage)}
              </Text>
              <Text style={[styles.quickStatLabel, { color: effectiveTheme === 'dark' ? themeColors.lightText : colors.white }]}>Coverage</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={dynamicStyles.contentSection}>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View
                key={index}
                style={[dynamicStyles.statCard, getCardStyle(stat.cardColor)]}
              >
                {index === 0 && (
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>+12%</Text>
                  </View>
                )}
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <View style={styles.statContent}>
                  <Text style={dynamicStyles.statValue} numberOfLines={1}>{stat.value}</Text>
                  <Text style={dynamicStyles.statLabel} numberOfLines={2}>{stat.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Performance Scores Section */}
          <View style={dynamicStyles.scoresSection}>
            <View style={[styles.scoresHeader, { borderBottomColor: themeColors.border }]}>
              <View style={styles.scoresHeaderLeft}>
                <View style={[styles.scoresHeaderIconContainer, { backgroundColor: effectiveTheme === 'dark' ? themeColors.lightGrayBg : '#FEF3C7' }]}>
                  <Text style={styles.scoresHeaderIcon}>🏆</Text>
                </View>
                <View style={styles.scoresHeaderText}>
                  <Text style={dynamicStyles.sectionHeader}>PERFORMANCE SCORES</Text>
                  <Text style={dynamicStyles.scoresSubtitle}>Your overall performance metrics</Text>
                </View>
              </View>
            </View>

            {/* Performance Chart */}
            <PerformanceChart scores={scores} />
          </View>

          {/* Contact Information */}
          <View style={dynamicStyles.infoSection}>
            <Text style={dynamicStyles.sectionHeader}>CONTACT DETAILS</Text>
            <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
              <Text style={styles.infoIcon}>📧</Text>
              <Text style={dynamicStyles.infoLabel}>Email</Text>
              <Text style={dynamicStyles.infoValue}>{displayOfficer && displayOfficer.email_id ? displayOfficer.email_id : 'N/A'}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={dynamicStyles.infoLabel}>Phone</Text>
              <Text style={dynamicStyles.infoValue}>
                {(() => {
                  // Try multiple sources for phone number with priority:
                  // 1. Redux officer.mobile (most recent update)
                  // 2. profileData.mobile (from API fetch)
                  // 3. displayOfficer.mobile (merged data)
                  let phone = '';
                  
                  if (officer && officer.mobile && typeof officer.mobile === 'string' && officer.mobile.trim() !== '') {
                    phone = officer.mobile;
                  } else if (profileData && profileData.mobile && typeof profileData.mobile === 'string' && profileData.mobile.trim() !== '') {
                    phone = profileData.mobile;
                  } else if (displayOfficer && displayOfficer.mobile && typeof displayOfficer.mobile === 'string' && displayOfficer.mobile.trim() !== '') {
                    phone = displayOfficer.mobile;
                  } else {
                    phone = 'NA';
                  }
                  
                  // Phone number extraction - warnings removed as requested
                  // Logging removed for phone number not found cases
                  
                  return phone;
                })()}
              </Text>
            </View>
            {displayOfficer && displayOfficer.badge_number && (
              <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
                <Text style={styles.infoIcon}>🆔</Text>
                <Text style={dynamicStyles.infoLabel}>Badge Number</Text>
                <Text style={dynamicStyles.infoValue}>{displayOfficer.badge_number}</Text>
              </View>
            )}
            {geofenceName && (
              <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={dynamicStyles.infoLabel}>Assigned Geofence</Text>
                <Text style={dynamicStyles.infoValue}>{geofenceName}</Text>
              </View>
            )}
            {displayOfficer && displayOfficer.shift_schedule && (
              <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
                <Text style={styles.infoIcon}>🕐</Text>
                <Text style={dynamicStyles.infoLabel}>Shift Schedule</Text>
                <Text style={dynamicStyles.infoValue}>{displayOfficer.shift_schedule}</Text>
              </View>
            )}
            <View style={[styles.infoRow, { borderBottomColor: themeColors.border }]}>
              <Text style={styles.infoIcon}>🆔</Text>
              <Text style={dynamicStyles.infoLabel}>Security ID</Text>
              <Text style={dynamicStyles.infoValue}>#{displayOfficer && displayOfficer.security_id ? displayOfficer.security_id : 'N/A'}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast, { borderBottomColor: themeColors.border }]}>
              <Text style={styles.infoIcon}>✓</Text>
              <Text style={dynamicStyles.infoLabel}>Status</Text>
              <Text style={[
                dynamicStyles.infoValue,
                displayOfficer && displayOfficer.status === 'active' ? styles.statusActive : styles.statusInactive
              ]}>
                {displayOfficer && displayOfficer.status 
                  ? displayOfficer.status.charAt(0).toUpperCase() + displayOfficer.status.slice(1)
                  : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: themeColors.primary }]}
            onPress={() => {
              navigation.navigate('UpdateProfile');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.updateButtonText, { color: themeColors.white }]}>UPDATE PROFILE</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: themeColors.emergencyRed }]}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.logoutButtonText, { color: themeColors.white }]}>LOGOUT</Text>
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
  updateButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    ...shadows.md,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.5,
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
    marginTop: 0,
    marginBottom: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.emergencyRed,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
  statusActive: {
    color: colors.successGreen,
    fontWeight: '600',
  },
  statusInactive: {
    color: colors.warningOrange,
    fontWeight: '600',
  },
});
