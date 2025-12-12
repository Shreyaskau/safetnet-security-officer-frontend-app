import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView, Platform, Alert as RNAlert } from 'react-native';
import { WebView } from 'react-native-webview';
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

  return (
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

      <WebView
        source={{ html: getAlertMapHTML(userLocation, officerLocation, alert) }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />

      <View style={styles.detailsCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.emergencyHeader}>🚨 EMERGENCY ALERT</Text>

          <View style={styles.userInfoRow}>
            <Image
              source={{ uri: alert.user_image || 'https://via.placeholder.com/80' }}
              style={styles.userProfileImage}
            />
            <View style={styles.userDetailsColumn}>
              <Text style={styles.userName}>{alert.user_name || 'Unknown User'}</Text>
              <View style={styles.emergencyTypeBadge}>
                <Text style={styles.emergencyTypeText}>
                  {alert.alert_type === 'emergency' ? 'EMERGENCY' : 'NORMAL'}
                </Text>
              </View>
              <Text style={styles.contactInfo}>📞 {alert.user_phone || 'N/A'}</Text>
              <Text style={styles.timeInfo}>
                {alert.timestamp ? formatRelativeTime(alert.timestamp) : 'Just now'}
              </Text>
            </View>
          </View>

          <View style={styles.locationSection}>
            <Text style={styles.addressText}>📍 {alert.location?.address || 'Location not available'}</Text>
            {distance !== null && distance !== undefined && (
              <Text style={styles.distanceText}>{distance.toFixed(1)} mi away</Text>
            )}
            {estimatedArrival !== null && estimatedArrival !== undefined && (
              <Text style={styles.etaText}>ETA: ~{estimatedArrival} min</Text>
            )}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.darkBackground,
    zIndex: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 80, // Same width as back button to center title
  },
  map: {
    flex: 0.7, // 70% of screen
  },
  detailsCard: {
    flex: 0.3, // 30% of screen
    backgroundColor: colors.darkBackground, // #0F172A
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    ...shadows.lg,
  },
  emergencyHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.white,
  },
  userDetailsColumn: {
    marginLeft: 12,
    justifyContent: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  emergencyTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.warningOrange,
    marginTop: 4,
  },
  emergencyTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  contactInfo: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.white,
    opacity: 0.9,
    marginTop: 6,
  },
  timeInfo: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.warningOrange,
    marginTop: 4,
  },
  locationSection: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.white,
    lineHeight: 20,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  etaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.successGreen,
    marginTop: 4,
  },
  messageSection: {
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.white,
    opacity: 0.7,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.white,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 3,
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  navigationButton: {
    flex: 1,
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationIcon: {
    fontSize: 24,
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
    
    // Initialize map
    const map = L.map('map').setView(center, 13);
    
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
    
    // Fit map to show both markers if officer location is available
    if (officerLoc) {
      const group = new L.featureGroup([userMarker, officerMarker]);
      map.fitBounds(group.getBounds().pad(0.2));
    } else {
      map.setView(userLoc, 15);
    }
  </script>
</body>
</html>
  `;
};
