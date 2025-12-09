import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import { useLocation } from '../../hooks/useLocation';
import { geofenceService } from '../../api/services/geofenceService';
import { SecurityMap } from '../../components/maps/SecurityMap';
import { GeofenceOverlay } from '../../components/maps/GeofenceOverlay';
import { CustomMarker } from '../../components/maps/CustomMarker';
import { MapControls } from '../../components/maps/MapControls';
import { MapLegend } from '../../components/maps/MapLegend';
import { colors, typography, spacing } from '../../utils';
import { GeofenceArea } from '../../types/location.types';

export const GeofenceMapScreen = ({ navigation }: any) => {
  const officer = useAppSelector((state) => state.auth.officer);
  const { location } = useLocation();
  const [geofence, setGeofence] = useState<GeofenceArea | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (officer && officer.geofence_id) {
      fetchGeofence();
    } else {
      setIsLoading(false);
    }
  }, [officer]);

  const fetchGeofence = async () => {
    if (!officer || !officer.geofence_id) return;
    setIsLoading(true);
    try {
      const data = await geofenceService.getGeofenceDetails(officer.geofence_id);
      setGeofence(data);
    } catch (error: any) {
      // Handle errors gracefully
      if ((error.response && error.response.status === 404) || (error.message && error.message.includes('not found'))) {
        // Silently handle 404 - backend endpoint not available or geofence not found
        setGeofence(null);
      } else {
        console.error('Error fetching geofence:', error);
        setGeofence(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Default region (Mumbai, India) if no geofence or location
  const defaultRegion = {
    latitude: 19.0760,
    longitude: 72.8777,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  let mapRegion = defaultRegion;
  if (geofence) {
    mapRegion = {
      latitude: geofence.center.latitude,
      longitude: geofence.center.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  } else if (location) {
    mapRegion = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>GEOFENCE AREA</Text>
          <Text style={styles.subtitle}>
            {isLoading ? 'Loading...' : (geofence && geofence.name ? geofence.name : 'No area assigned')}
          </Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <SecurityMap
        style={styles.map}
        initialRegion={mapRegion}
      >
        {geofence && <GeofenceOverlay geofence={geofence} />}
        {location && (
          <CustomMarker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            type="officer"
            label="You"
          />
        )}
      </SecurityMap>

      <MapControls
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onRecenter={() => {}}
        onLayerToggle={() => {}}
      />

      <MapLegend
        items={[
          { icon: '🛡️', label: 'Your Location' },
          { icon: '👤', label: 'Active User' },
        ]}
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoHeader}>YOUR ASSIGNED AREA</Text>
        {geofence ? (
          <>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Text style={styles.areaName}>{geofence.name}</Text>
                <View style={styles.zoneBadge}>
                  <Text style={styles.zoneText}>Zone {geofence.geofence_id.slice(-1)}</Text>
                </View>
                <Text style={styles.coverage}>
                  {(geofence.area_size && typeof geofence.area_size === 'number') ? geofence.area_size.toFixed(1) : '0'} km² • {geofence.radius ? (geofence.radius / 1000).toFixed(1) : '1.5'} km radius
                </Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.userCount}>
                  {geofence.active_users_count || 0}
                </Text>
                <Text style={styles.userLabel}>Users Monitored</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.areaName}>
                {isLoading ? 'Loading area details...' : 'No area assigned'}
              </Text>
              <Text style={styles.coverage}>
                Please contact administrator to assign a geofence area
              </Text>
            </View>
          </View>
        )}
        {geofence && (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Text style={styles.statText}>🔴 3 Emergency</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statText}>🟡 5 Pending</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statText}>🟢 45 Completed</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>VIEW ALL USERS</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.broadcastLink}
              onPress={() => navigation.navigate('Broadcast')}
            >
              <Text style={styles.broadcastText}>SEND BROADCAST</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  backIcon: {
    fontSize: 24,
    color: colors.darkText,
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    ...typography.sectionHeader,
  },
  subtitle: {
    ...typography.caption,
    color: colors.lightText,
    marginTop: spacing.xs,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.darkText,
  },
  map: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  infoHeader: {
    ...typography.caption,
    color: colors.lightText,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  infoLeft: {
    flex: 1,
  },
  areaName: {
    ...typography.sectionHeader,
    marginBottom: spacing.xs,
  },
  zoneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  zoneText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  coverage: {
    ...typography.caption,
    color: colors.lightText,
  },
  infoRight: {
    alignItems: 'flex-end',
  },
  userCount: {
    ...typography.screenHeader,
    color: colors.successGreen,
    marginBottom: spacing.xs,
  },
  userLabel: {
    ...typography.caption,
    color: colors.lightText,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  statBadge: {
    backgroundColor: colors.lightGrayBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statText: {
    ...typography.caption,
    fontSize: 11,
  },
  viewButton: {
    backgroundColor: colors.mediumGray,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewButtonText: {
    ...typography.buttonLarge,
    color: colors.white,
  },
  broadcastLink: {
    alignItems: 'center',
  },
  broadcastText: {
    ...typography.secondary,
    color: colors.primary,
  },
});

