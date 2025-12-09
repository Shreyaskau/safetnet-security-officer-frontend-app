import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Alert } from '../../types/alert.types';
import { useLocation } from '../../hooks/useLocation';
import { locationService } from '../../api/services/locationService';
import { AcceptAlertModal } from '../../components/modals/AcceptAlertModal';
import { SecurityMap } from '../../components/maps/SecurityMap';
import { CustomMarker } from '../../components/maps/CustomMarker';
import { RoutePolyline } from '../../components/maps/RoutePolyline';
import { colors, shadows } from '../../utils';
import { calculateDistance, formatRelativeTime } from '../../utils/helpers';
import { useAlerts } from '../../hooks/useAlerts';

export const AlertResponseScreen = ({ route, navigation }: any) => {
  const { alert } = route.params as { alert: Alert };
  const { location: officerLocation } = useLocation();
  const { acceptAlert } = useAlerts();
  const [userLocation, setUserLocation] = useState(alert.location);
  const [estimatedArrival, setEstimatedArrival] = useState<number | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  useEffect(() => {
    // Poll user location every 5 seconds
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
        console.error('Error fetching user location:', error);
      }
    }, 5000);

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

    return () => clearInterval(interval);
  }, [officerLocation, alert.user_id]);

  const handleAccept = async () => {
    try {
      await acceptAlert(alert.log_id, estimatedArrival || undefined);
      setShowAcceptModal(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error accepting alert:', error);
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${alert.user_phone}`);
  };

  const handleNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${userLocation.latitude},${userLocation.longitude}`;
    Linking.openURL(url);
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

      <SecurityMap
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        style={styles.map}
      >
        {/* Officer Marker */}
        {officerLocation && (
          <CustomMarker
            coordinate={{
              latitude: officerLocation.latitude,
              longitude: officerLocation.longitude,
            }}
            type="officer"
            label="You"
          />
        )}

        {/* User Marker */}
        <CustomMarker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          type="emergency"
          label={alert.user_name}
        />

        {/* Route Line */}
        {officerLocation && (
          <RoutePolyline
            origin={officerLocation}
            destination={userLocation}
          />
        )}
      </SecurityMap>

      <View style={styles.detailsCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.emergencyHeader}>🚨 EMERGENCY ALERT</Text>

          <View style={styles.userInfoRow}>
            <Image
              source={{ uri: alert.user_image || 'https://via.placeholder.com/80' }}
              style={styles.userProfileImage}
            />
            <View style={styles.userDetailsColumn}>
              <Text style={styles.userName}>{alert.user_name}</Text>
              <View style={styles.emergencyTypeBadge}>
                <Text style={styles.emergencyTypeText}>
                  {alert.alert_type === 'emergency' ? 'EMERGENCY' : 'NORMAL'}
                </Text>
              </View>
              <Text style={styles.contactInfo}>📞 {alert.user_phone}</Text>
              <Text style={styles.timeInfo}>
                {formatRelativeTime(alert.timestamp)}
              </Text>
            </View>
          </View>

          <View style={styles.locationSection}>
            <Text style={styles.addressText}>📍 {alert.location.address}</Text>
            {distance && (
              <Text style={styles.distanceText}>{distance.toFixed(1)} mi away</Text>
            )}
            {estimatedArrival && (
              <Text style={styles.etaText}>ETA: ~{estimatedArrival} min</Text>
            )}
          </View>

          {alert.message && (
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
