import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView, Platform, Alert as RNAlert, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Alert } from '../../types/alert.types';
import { useLocation } from '../../hooks/useLocation';
import { locationService } from '../../api/services/locationService';
import { AcceptAlertModal } from '../../components/modals/AcceptAlertModal';
import { colors, shadows } from '../../utils';
import { calculateDistance, formatRelativeTime } from '../../utils/helpers';
import { useAlerts } from '../../hooks/useAlerts';
import { requestLocationPermissionWithCheck } from '../../utils/permissions';

export const AlertResponseScreen = ({ route, navigation }: any) => {
  const { alert } = route.params as { alert: Alert };
  const { location: officerLocation, getCurrentLocation } = useLocation();
  const { acceptAlert } = useAlerts();
  const [userLocation, setUserLocation] = useState(alert.location);
  const [estimatedArrival, setEstimatedArrival] = useState<number | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Get alert type description - same logic as AlertCard
  const getAlertTypeDescription = (): { type: string; description: string } => {
    // Check if this is a high priority alert - show as "Emergency Alert"
    const isHighPriority = alert.priority?.toLowerCase() === 'high';
    
    if (isHighPriority) {
      return {
        type: 'Emergency Alert',
        description: 'Critical alert requiring immediate response and action'
      };
    }
    
    // ALWAYS prefer original_alert_type if available (what user actually selected)
    const displayType = alert.original_alert_type || alert.alert_type || 'normal';
    
    const typeInfoMap: Record<string, { type: string; description: string }> = {
      // Original types (what user selects on creation page)
      general: {
        type: 'General Notice',
        description: 'Informational alert for general updates and announcements'
      },
      warning: {
        type: 'Warning',
        description: 'Cautionary alert requiring attention and immediate awareness'
      },
      emergency: {
        type: 'Emergency',
        description: 'Critical alert requiring immediate response and action'
      },
      // Backend stored types (fallback)
      normal: {
        type: 'Normal Alert',
        description: 'Standard alert for routine notifications'
      },
      security: {
        type: 'Security Alert',
        description: 'Security-related alert requiring security personnel attention'
      },
    };
    
    const safeDisplayType = typeof displayType === 'string' ? displayType : 'normal';
    
    return typeInfoMap[safeDisplayType] || {
      type: safeDisplayType.charAt(0).toUpperCase() + safeDisplayType.slice(1) + ' Alert',
      description: 'Alert notification'
    };
  };

  const alertTypeInfo = getAlertTypeDescription();
  
  // Determine color based on alert type
  const getAlertTypeColor = () => {
    const isHighPriority = alert.priority?.toLowerCase() === 'high';
    const alertType = alert.original_alert_type || alert.alert_type;
    
    if (isHighPriority || alertType === 'emergency') {
      return colors.emergencyRed; // Red for Emergency Alert
    } else if (alertType === 'warning') {
      return '#FBBF24'; // Yellow for Warning
    } else {
      return colors.infoBlue; // Blue for General Notice
    }
  };
  
  const alertTypeColor = getAlertTypeColor();
  
  // Determine icon based on alert type
  const getAlertTypeIcon = () => {
    const isHighPriority = alert.priority?.toLowerCase() === 'high';
    const alertType = alert.original_alert_type || alert.alert_type;
    
    if (isHighPriority || alertType === 'emergency') {
      return 'warning';
    } else if (alertType === 'warning') {
      return 'warning';
    } else {
      return 'notifications';
    }
  };

  // Request location permission when screen loads
  useEffect(() => {
    async function requestPermission() {
      setIsRequestingPermission(true);
      try {
        const hasPermission = await requestLocationPermissionWithCheck(true);
        if (hasPermission) {
          // Try to get current location after permission is granted
          try {
            await getCurrentLocation();
          } catch (error) {
            console.warn('Error getting location after permission granted:', error);
          }
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
      } finally {
        setIsRequestingPermission(false);
      }
    }
    requestPermission();
  }, []);

  useEffect(() => {
    // Note: User location is already in the alert object
    // The alert contains the location when it was created
    // Polling for user location updates is disabled as the endpoint doesn't exist
    // If you need live updates, use the SOS alert refresh endpoint instead
    // 
    // For now, we use the location from the alert which is the initial emergency location
    
    // Calculate estimated arrival time
    if (officerLocation) {
      const distance = calculateDistance(
        officerLocation.latitude,
        officerLocation.longitude,
        userLocation.latitude,
        userLocation.longitude
      );
      // Assume average speed of 30 mph
      const timeInMinutes = Math.round((distance / 30) * 60);
      setEstimatedArrival(timeInMinutes);
    }
    
    // No cleanup needed since we're not using intervals anymore
    // Uncomment below if user location polling becomes available:
    /*
    const interval = setInterval(async () => {
      try {
        const data = await locationService.getUserLocation(alert.user_id);
        if (data.latitude && data.longitude) {
          setUserLocation({
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            address: userLocation.address,
          });
        }
      } catch (error) {
        // Silently fail - user location comes from alert
        console.warn('User location polling not available, using alert location');
      }
    }, 5000);
    return () => clearInterval(interval);
    */
  }, [officerLocation, userLocation, alert.user_id]);

  const handleAccept = async () => {
    try {
      // Get alert ID - try log_id first, then id, then fallback
      const alertId = alert.log_id || alert.id;
      
      if (!alertId) {
        RNAlert.alert(
          'Error',
          'Alert ID is missing. Cannot accept this alert.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Ensure we have location permission before accepting
      const hasPermission = await requestLocationPermissionWithCheck(true);
      if (!hasPermission) {
        RNAlert.alert(
          'Location Permission Required',
          'Location permission is required to calculate distance and estimated arrival time. Please grant permission to continue.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Grant Permission',
              onPress: async () => {
                const granted = await requestLocationPermissionWithCheck(true);
                if (granted) {
                  // Retry accepting after permission is granted
                  try {
                    await acceptAlert(alertId, estimatedArrival || undefined);
                    setShowAcceptModal(false);
                    navigation.goBack();
                  } catch (error) {
                    console.error('Error accepting alert:', error);
                    RNAlert.alert('Error', 'Failed to accept alert. Please try again.');
                  }
                }
              }
            }
          ]
        );
        return;
      }

      await acceptAlert(alertId, estimatedArrival || undefined);
      setShowAcceptModal(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error accepting alert:', error);
      RNAlert.alert('Error', 'Failed to accept alert. Please try again.');
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${alert.user_phone}`);
  };

  const handleNavigation = () => {
    // Use platform-agnostic maps URL that opens default maps app
    // iOS: Opens Apple Maps
    // Android: Opens default maps app (usually Google Maps if installed, else asks user)
    const { latitude, longitude } = userLocation;
    let url = '';
    
    if (Platform.OS === 'ios') {
      // Apple Maps URL scheme
      url = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
    } else {
      // Android: Use geo: URI which opens default maps app
      // Falls back to browser-based maps if no app is available
      url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
    }
    
    Linking.openURL(url).catch((err) => {
      console.error('Error opening maps:', err);
      // Fallback: Use generic coordinates URL that works in any browser
      const fallbackUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
      Linking.openURL(fallbackUrl).catch(() => {
        console.error('Failed to open any maps application');
      });
    });
  };

  const distance = officerLocation
    ? calculateDistance(
        officerLocation.latitude,
        officerLocation.longitude,
        userLocation.latitude,
        userLocation.longitude
      )
    : null;

  // Format location address - use address if available, else format coordinates
  const formatLocationAddress = () => {
    if (alert.location?.address && alert.location.address !== 'Location not available' && alert.location.address.trim() !== '') {
      return alert.location.address;
    }
    // Format coordinates as readable address
    if (userLocation.latitude && userLocation.longitude) {
      return `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`;
    }
    return 'Location not available';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <View style={styles.container}>
      <AcceptAlertModal
        visible={showAcceptModal}
        alert={alert}
        officerLocation={officerLocation}
        estimatedArrival={estimatedArrival || undefined}
        onConfirm={handleAccept}
        onCancel={() => setShowAcceptModal(false)}
        onCall={handleCall}
        onViewLocation={() => {}}
      />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contentWrapper}>
        <WebView
          source={{ html: getAlertMapHTML(userLocation, officerLocation, alert) }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />

        {/* Details card overlaid on top of map */}
        <View style={styles.detailsCard}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled={true}
          bounces={false}
        >
          {/* Compact Alert Header - No Card */}
          <View style={styles.emergencyHeaderContainer}>
            <Icon 
              name={getAlertTypeIcon()} 
              size={16} 
              color={alertTypeColor} 
            />
            <Text style={[
              styles.emergencyLabel,
              { color: alertTypeColor }
            ]}>
              {alertTypeInfo.type.toUpperCase()}
            </Text>
          </View>

          {/* Compact User Info - No Card */}
          <View style={styles.userInfoRow}>
            <Text style={styles.userName}>{alert.user_name || 'Unknown User'}</Text>
            <Text style={styles.contactInfo}>📞 {alert.user_phone || 'N/A'}</Text>
            <Text style={styles.timeInfo}>
              {alert.timestamp ? formatRelativeTime(alert.timestamp) : 'Just now'}
            </Text>
          </View>

          <View style={styles.locationSection}>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.addressText}>{formatLocationAddress()}</Text>
            </View>
            <View style={styles.locationMetaRow}>
              {distance !== null && distance !== undefined && (
                <View style={styles.metaBadge}>
                  <Text style={styles.metaText}>{distance.toFixed(1)} mi away</Text>
                </View>
              )}
              {estimatedArrival !== null && estimatedArrival !== undefined && (
                <View style={styles.etaBadge}>
                  <Text style={styles.etaText}>ETA: ~{estimatedArrival} min</Text>
                </View>
              )}
            </View>
          </View>

          {alert.message && alert.message.trim() !== '' && (
            <View style={styles.messageSection}>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.messageText}>{alert.message}</Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => setShowAcceptModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptButtonText}>🛡️ ACCEPT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navigationButton}
              onPress={handleNavigation}
              activeOpacity={0.8}
            >
              <Text style={styles.navigationIcon}>🧭</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      </View>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.lightGrayBg,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
    ...shadows.sm,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.lightGrayBg,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkText,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkText,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 80, // Same width as back button to center title
  },
  map: {
    flex: 1, // Map takes full height
    width: '100%',
  },
  detailsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%', // Details take 30% of screen height
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 15 : 12,
    ...shadows.lg,
    zIndex: 5,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scrollContent: {
    paddingBottom: 0,
    flexGrow: 0,
  },
  // Compact Emergency Header - No Card Background
  emergencyHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  emergencyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.emergencyRed,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  alertTypeBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.emergencyRed,
    backgroundColor: colors.badgeRedBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  // Compact User Info - No Card Background
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.darkText,
    letterSpacing: -0.1,
  },
  contactInfo: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.lightText,
  },
  timeInfo: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.warningOrange,
    backgroundColor: colors.badgeOrangeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  locationSection: {
    marginBottom: 10,
    backgroundColor: colors.lightGrayBg,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
    marginTop: 1,
  },
  addressText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.darkText,
    lineHeight: 16,
    flex: 1,
    flexWrap: 'wrap',
  },
  locationMetaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaBadge: {
    backgroundColor: colors.badgeBlueBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.infoBlue,
  },
  etaBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  etaText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.successGreen,
  },
  messageSection: {
    marginBottom: 8,
  },
  messageLabel: {
    fontSize: 9,
    fontWeight: '400',
    color: colors.lightText,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.darkText,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    paddingTop: 8,
  },
  acceptButton: {
    flex: 3,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    elevation: 4,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  navigationButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    elevation: 4,
  },
  navigationIcon: {
    fontSize: 22,
    color: colors.white,
  },
});

// Generate Leaflet map HTML for alert details
const getAlertMapHTML = (
  userLocation: { latitude: number; longitude: number },
  officerLocation: { latitude: number; longitude: number } | null,
  alert: Alert
) => {
  // Calculate center point (between user and officer if officer location available, else use user location)
  const center = officerLocation
    ? {
        lat: (userLocation.latitude + officerLocation.latitude) / 2,
        lng: (userLocation.longitude + officerLocation.longitude) / 2,
      }
    : {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };

  // Create route polyline coordinates if officer location is available
  const routeCoordinates = officerLocation
    ? `[[${officerLocation.latitude}, ${officerLocation.longitude}], [${userLocation.latitude}, ${userLocation.longitude}]]`
    : '[]';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const center = [${center.lat}, ${center.lng}];
    const userLoc = [${userLocation.latitude}, ${userLocation.longitude}];
    const officerLoc = ${officerLocation ? `[${officerLocation.latitude}, ${officerLocation.longitude}]` : 'null'};
    const routeCoords = ${routeCoordinates};
    
    // Initialize map with wider zoom level
    const map = L.map('map').setView(center, 11);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Add user location marker (emergency)
    const userMarker = L.marker(userLoc, {
      icon: L.divIcon({
        className: 'emergency-marker',
        html: '<div style="font-size: 40px;">🚨</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })
    }).addTo(map);
    userMarker.bindPopup('${(alert.user_name || 'User').replace(/'/g, "\\'")}<br/>Emergency Location');
    
    // Add officer location marker if available
    let officerMarker = null;
    if (officerLoc) {
      officerMarker = L.marker(officerLoc, {
        icon: L.divIcon({
          className: 'officer-marker',
          html: '<div style="font-size: 35px;">🛡️</div>',
          iconSize: [35, 35],
          iconAnchor: [17, 35]
        })
      }).addTo(map);
      officerMarker.bindPopup('You<br/>Your Location');
    }
    
    // Add route polyline if officer location is available
    if (routeCoords && routeCoords.length === 2) {
      const routePolyline = L.polyline(routeCoords, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(map);
    }
    
    // Show wider view - don't zoom in too much
    if (officerLoc) {
      const group = new L.featureGroup([userMarker, officerMarker]);
      // Use wider padding and ensure minimum zoom level
      map.fitBounds(group.getBounds().pad(0.5), {
        maxZoom: 12,
        padding: [50, 50]
      });
    } else {
      // Use lower zoom level for wider view
      map.setView(userLoc, 11);
    }
  </script>
</body>
</html>
  `;
};
