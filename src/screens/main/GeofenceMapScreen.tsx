import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import { useAppSelector } from '../../redux/hooks';
import { useLocation } from '../../hooks/useLocation';
import { geofenceService } from '../../api/services/geofenceService';
import { profileService } from '../../api/services/profileService';
import { useAlerts } from '../../hooks/useAlerts';
// Removed local data fallback - using only actual backend data
import { MapControls } from '../../components/maps/MapControls';
import { colors, typography, spacing } from '../../utils';
import { isPointInPolygon } from '../../utils/helpers';
import { GeofenceArea } from '../../types/location.types';
import { updateOfficerProfile } from '../../redux/slices/authSlice';
import { useAppDispatch } from '../../redux/hooks';
import { requestLocationPermissionWithCheck } from '../../utils/permissions';

export const GeofenceMapScreen = ({ navigation }: any) => {
  const officer = useAppSelector((state) => state.auth.officer);
  const dispatch = useAppDispatch();
  const { location } = useLocation();
  const { allAlerts } = useAlerts(); // Get actual alert data from backend
  const [geofence, setGeofence] = useState<GeofenceArea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(location);
  const [wasInsideGeofence, setWasInsideGeofence] = useState<boolean | null>(null); // Track previous state for entry/exit detection
  const webViewRef = useRef(null);
  const watchIdRef = useRef<number | null>(null);

  // Define fetchGeofence before useEffect so it's available
  const fetchGeofence = useCallback(async () => {
    if (!officer || !officer.geofence_id) {
      console.warn('[GeofenceMap] No officer or geofence_id available:', { 
        hasOfficer: !!officer, 
        geofenceId: officer?.geofence_id,
        fullOfficer: officer
      });
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('[GeofenceMap] Fetching geofence for officer:', officer.name, 'geofence_id:', officer.geofence_id, 'type:', typeof officer.geofence_id);
      const data = await geofenceService.getGeofenceDetails(officer.geofence_id);
      console.log('[GeofenceMap] Geofence fetched successfully:', {
        name: data.name,
        geofence_id: data.geofence_id,
        coordinatesCount: data.coordinates?.length || 0,
        hasCenter: !!data.center,
        center: data.center,
        fullData: data
      });
      
      // Verify coordinates are present
      if (!data.coordinates || data.coordinates.length === 0) {
        console.warn('[GeofenceMap] WARNING: Geofence fetched but no coordinates found!', data);
      }
      
      setGeofence(data);
      // Reset geofence entry state when geofence changes
      setWasInsideGeofence(null);
    } catch (error: any) {
      // Handle errors gracefully
      console.error('[GeofenceMap] Full error object:', error);
      if (error?.response) {
        console.error('[GeofenceMap] Error response status:', error.response.status);
        console.error('[GeofenceMap] Error response data:', JSON.stringify(error.response.data, null, 2));
      }
      
      if ((error.response && error.response.status === 404) || (error.message && error.message.includes('not found'))) {
        console.warn('[GeofenceMap] Geofence not found (404) - geofence_id:', officer.geofence_id);
        setGeofence(null);
      } else if (error.response && error.response.status === 400) {
        console.error('[GeofenceMap] Bad request (400) - Invalid geofence_id:', officer.geofence_id, error.response.data);
        setGeofence(null);
      } else {
        console.error('[GeofenceMap] Error fetching geofence:', error.message || error);
        
        // Log error details for debugging
        console.error('[GeofenceMap] Error fetching geofence from backend:', error.message || error);
        console.error('[GeofenceMap] Error stack:', error.stack);
        setGeofence(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [officer]);

  // Fetch geofence when component mounts or officer changes
  useEffect(() => {
    const loadGeofence = async () => {
      console.log('[GeofenceMap] Component mounted/updated');
      
      // Log officer data for debugging
      console.log('[GeofenceMap] useEffect triggered - Officer data:', {
        hasOfficer: !!officer,
        officerName: officer?.name,
        geofence_id: officer?.geofence_id,
        geofence_idType: typeof officer?.geofence_id,
        geofence_idEmpty: !officer?.geofence_id || officer?.geofence_id === '',
        geofence_idLength: officer?.geofence_id?.toString().length || 0,
        security_id: officer?.security_id,
        fullOfficer: officer ? JSON.stringify(officer, null, 2) : 'null'
      });

      if (!officer) {
        console.warn('[GeofenceMap] No officer object available yet');
        setIsLoading(false);
        return;
      }

      // Check for valid geofence_id (not empty, not '0', not 0)
      const geofenceId = officer.geofence_id;
      const isValidGeofenceId = geofenceId && 
                                 geofenceId !== '' && 
                                 geofenceId !== '0' && 
                                 geofenceId !== 0 &&
                                 String(geofenceId).trim() !== '';

      if (!isValidGeofenceId) {
        // Only log as info, not warning, since we'll try to fetch from profile
        console.log('[GeofenceMap] No geofence_id in officer object, will fetch from profile', {
          hasOfficer: !!officer,
          hasGeofenceId: !!geofenceId,
          geofenceIdValue: geofenceId,
          geofenceIdType: typeof geofenceId,
        });
        
        // Try to fetch profile to get geofence_id if missing
        if (officer && officer.security_id) {
          console.log('[GeofenceMap] Attempting to fetch profile to get geofence_id...');
          try {
            const profile = await profileService.getProfile(officer.security_id);
            console.log('[GeofenceMap] Profile fetched:', JSON.stringify(profile, null, 2));
            
            // Extract geofence_id from profile - handle multiple formats
            // Check for ID fields first
            let profileGeofenceId = (profile as any)?.geofence_id || 
                                   (profile as any)?.assigned_geofence?.id?.toString() ||
                                   (profile as any)?.assigned_geofence_id?.toString() ||
                                   (profile as any)?.officer_id?.toString() ||  // Sometimes officer_id is geofence_id
                                   '';
            
            // If no ID found, check for geofence name and try to fetch by name
            if (!profileGeofenceId || profileGeofenceId === '') {
              const geofenceName = (profile as any)?.officer_geofence || 
                                 (profile as any)?.geofence_name || 
                                 (profile as any)?.assigned_geofence?.name ||
                                 '';
              
              if (geofenceName) {
                console.log('[GeofenceMap] Found geofence name in profile:', geofenceName);
                
                // Try to fetch geofence using the name directly (some APIs accept names)
                try {
                  console.log('[GeofenceMap] Attempting to fetch geofence by name:', geofenceName);
                  const geofenceData = await geofenceService.getGeofenceDetails(geofenceName);
                  console.log('[GeofenceMap] ✅ Successfully fetched geofence by name:', geofenceName);
                  setGeofence(geofenceData);
                  setIsLoading(false);
                  return;
                } catch (nameError: any) {
                  console.log('[GeofenceMap] Fetching by name failed, will try fallback:', nameError?.message);
                  // Continue to fallback logic below
                }
              }
            }
            
            if (profileGeofenceId && profileGeofenceId !== '' && profileGeofenceId !== '0') {
              console.log('[GeofenceMap] Found geofence_id in profile:', profileGeofenceId);
              dispatch(updateOfficerProfile({ geofence_id: profileGeofenceId }));
              // Retry fetching geofence with the new ID
              setTimeout(() => {
                fetchGeofence();
              }, 500);
              return;
            } else {
              // If no geofence_id found, check if we have a geofence name
              const geofenceName = (profile as any)?.officer_geofence || 
                                 (profile as any)?.geofence_name || 
                                 (profile as any)?.assigned_geofence?.name ||
                                 '';
              
              if (geofenceName) {
                console.log('[GeofenceMap] No geofence_id found, but geofence name exists:', geofenceName);
                console.log('[GeofenceMap] Attempting to fetch geofence using name...');
                
                // Try fetching geofence by name
                try {
                  const geofenceData = await geofenceService.getGeofenceDetails(geofenceName);
                  console.log('[GeofenceMap] ✅ Successfully fetched geofence using name');
                  setGeofence(geofenceData);
                  setIsLoading(false);
                  return;
                } catch (error: any) {
                  // Backend API failed - log error and show no geofence
                  console.error('[GeofenceMap] Failed to fetch geofence from backend:', error.message || error);
                  if (error.response) {
                    console.error('[GeofenceMap] Backend response status:', error.response.status);
                    console.error('[GeofenceMap] Backend response data:', error.response.data);
                  }
                  setGeofence(null);
                  setIsLoading(false);
                  return;
                }
              } else {
                console.warn('[GeofenceMap] Profile fetched but geofence_id and geofence name not found');
              }
            }
          } catch (error) {
            console.error('[GeofenceMap] Error fetching profile:', error);
          }
        }
        
        setIsLoading(false);
        return;
      }

      console.log('[GeofenceMap] Officer has valid geofence_id:', geofenceId, 'calling fetchGeofence()');
      fetchGeofence();
    };

    loadGeofence();
  }, [officer, fetchGeofence, dispatch]);

  // Determine map center
  const getMapCenter = () => {
    if (geofence && geofence.center) {
      return {
        lat: geofence.center.latitude,
        lng: geofence.center.longitude,
      };
    } else if (currentLocation) {
      return {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      };
    }
    // Default to Mumbai
    return { lat: 19.0760, lng: 72.8777 };
  };

  const mapCenter = getMapCenter();
  
  // Start live location tracking
  useEffect(() => {
    let mounted = true;
    
    const startTracking = async () => {
      try {
        const hasPermission = await requestLocationPermissionWithCheck(false);
        if (!hasPermission || !mounted) return;

        if (watchIdRef.current !== null) {
          Geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = Geolocation.watchPosition(
          (position) => {
            if (!mounted) return;
            
            if (position && position.coords) {
              const newLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy || undefined,
              };
              
              setCurrentLocation(newLocation);
              
              // Check if officer entered/exited geofence area
              if (geofence && geofence.coordinates && geofence.coordinates.length > 0) {
                const isInside = isPointInPolygon(newLocation, geofence.coordinates);
                
                // Check if state changed (entered or exited)
                if (wasInsideGeofence !== null && wasInsideGeofence !== isInside) {
                  if (isInside && !wasInsideGeofence) {
                    // Officer entered the geofence area
                    Alert.alert(
                      '✅ Area Entered',
                      `You have entered your allocated area: ${geofence.name || 'Geofence Area'}`,
                      [{ text: 'OK', style: 'default' }],
                      { cancelable: true }
                    );
                    console.log('[GeofenceMap] ✅ Officer entered geofence area:', geofence.name);
                  } else if (!isInside && wasInsideGeofence) {
                    // Officer exited the geofence area
                    Alert.alert(
                      '⚠️ Area Exited',
                      `You have left your allocated area: ${geofence.name || 'Geofence Area'}`,
                      [{ text: 'OK', style: 'default' }],
                      { cancelable: true }
                    );
                    console.log('[GeofenceMap] ⚠️ Officer exited geofence area:', geofence.name);
                  }
                }
                
                setWasInsideGeofence(isInside);
              } else if (wasInsideGeofence === null) {
                // Initialize state if geofence is not loaded yet
                setWasInsideGeofence(false);
              }
              
              // Update map marker with accuracy
              if (webViewRef.current) {
                const accuracy = position.coords.accuracy || 50; // Default to 50m if not available
                const script = `
                  if (window.updateUserLocation) {
                    window.updateUserLocation(${newLocation.latitude}, ${newLocation.longitude}, ${accuracy});
                  }
                `;
                webViewRef.current.injectJavaScript(script);
              }
            }
          },
          (error) => {
            console.warn('[GeofenceMap] Location tracking error:', error);
          },
          {
            enableHighAccuracy: true, // Use GPS for best accuracy
            distanceFilter: 5, // Update every 5 meters for better accuracy
            interval: 3000, // Update every 3 seconds
            fastestInterval: 1000, // Fastest update interval (1 second)
            showLocationDialog: true,
            forceRequestLocation: true,
          }
        );
      } catch (error) {
        console.error('[GeofenceMap] Error starting location tracking:', error);
      }
    };

    startTracking();

    return () => {
      mounted = false;
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Update map when location or geofence changes
  useEffect(() => {
    if (webViewRef.current && geofence && geofence.coordinates && geofence.coordinates.length > 0) {
      console.log('[GeofenceMap] Updating map with geofence data:', {
        name: geofence.name,
        coordinatesCount: geofence.coordinates.length,
        center: geofence.center
      });
      
      const geofencePolygon = JSON.stringify(
        geofence.coordinates.map(c => [c.latitude, c.longitude])
      );
      const center = getMapCenter();
      
      const script = `
        if (typeof L !== 'undefined' && L.map && typeof map !== 'undefined') {
          // Remove existing geofence polygon if any
          if (window.geofencePolygonLayer) {
            map.removeLayer(window.geofencePolygonLayer);
          }
          
          const geofenceCoords = ${geofencePolygon};
          if (geofenceCoords && geofenceCoords.length > 0) {
            window.geofencePolygonLayer = L.polygon(geofenceCoords, {
              color: '#2563eb',
              fillColor: '#2563eb',
              fillOpacity: 0.2,
              weight: 2
            }).addTo(map);
            
            // Expand bounds by 200 meters to show surrounding area
            const bounds = window.geofencePolygonLayer.getBounds();
            const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
            const centerLng = (bounds.getEast() + bounds.getWest()) / 2;
            
            // 200m in degrees: approximately 0.0018 degrees latitude
            // For longitude, it varies by latitude: 0.0018 / cos(latitude)
            const latOffset = 0.0018; // ~200m
            const lngOffset = 0.0018 / Math.cos(centerLat * Math.PI / 180); // ~200m adjusted for latitude
            
            // Expand bounds by 1km in all directions
            const expandedBounds = L.latLngBounds(
              [bounds.getSouth() - latOffset, bounds.getWest() - lngOffset],
              [bounds.getNorth() + latOffset, bounds.getEast() + lngOffset]
            );
            
            // Fit map to expanded bounds
            map.fitBounds(expandedBounds, {
              padding: [20, 20], // Small padding for UI elements
              maxZoom: 15 // Maximum zoom level
            });
            
            // Ensure minimum zoom level for better context
            if (map.getZoom() > 15) {
              map.setZoom(15);
            }
            console.log('Geofence polygon added and map fitted to bounds');
          }
        }
      `;
      
      // Wait a bit for map to be ready
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(script);
      }, 300);
    } else if (webViewRef.current && currentLocation) {
      const center = getMapCenter();
      const script = `
        if (window.updateMapCenter && typeof map !== 'undefined') {
          window.updateMapCenter(${center.lat}, ${center.lng});
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [currentLocation, geofence]);

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
        <TouchableOpacity 
          onPress={async () => {
            // Manual refresh button
            console.log('[GeofenceMap] Manual refresh triggered');
            
            if (!officer) {
              console.warn('[GeofenceMap] Cannot refresh - no officer object');
              return;
            }
            
            // If no geofence_id, try to fetch from profile first
            if (!officer.geofence_id || officer.geofence_id === '' || officer.geofence_id === '0') {
              console.log('[GeofenceMap] No geofence_id, fetching profile...');
              try {
                const profile = await profileService.getProfile(officer.security_id);
                
                // Extract geofence_id from profile - handle multiple formats
                let profileGeofenceId = (profile as any)?.geofence_id || 
                                       (profile as any)?.assigned_geofence?.id?.toString() ||
                                       (profile as any)?.assigned_geofence_id?.toString() ||
                                       (profile as any)?.officer_id?.toString() ||
                                       '';
                
                // If no ID found, check for geofence name and try to fetch by name
                if (!profileGeofenceId || profileGeofenceId === '') {
                  const geofenceName = (profile as any)?.officer_geofence || 
                                     (profile as any)?.geofence_name || 
                                     (profile as any)?.assigned_geofence?.name ||
                                     '';
                  
              if (geofenceName) {
                console.log('[GeofenceMap] Found geofence name in profile:', geofenceName);
                console.log('[GeofenceMap] Attempting to fetch geofence using name...');
                
                // Try fetching geofence by name directly
                try {
                  const geofenceData = await geofenceService.getGeofenceDetails(geofenceName);
                  console.log('[GeofenceMap] ✅ Successfully fetched geofence by name');
                  setGeofence(geofenceData);
                  setIsLoading(false);
                  return;
                } catch (nameError: any) {
                  // Backend API failed - log error
                  console.error('[GeofenceMap] Failed to fetch geofence by name from backend:', nameError.message || nameError);
                  if (nameError.response) {
                    console.error('[GeofenceMap] Backend response status:', nameError.response.status);
                    console.error('[GeofenceMap] Backend response data:', nameError.response.data);
                  }
                  setGeofence(null);
                  setIsLoading(false);
                  return;
                }
              }
                }
                
                if (profileGeofenceId && profileGeofenceId !== '' && profileGeofenceId !== '0') {
                  console.log('[GeofenceMap] Found geofence_id in profile:', profileGeofenceId);
                  dispatch(updateOfficerProfile({ geofence_id: profileGeofenceId }));
                  // Wait a moment for Redux to update, then fetch geofence
                  setTimeout(() => {
                    fetchGeofence();
                  }, 300);
                  return;
                }
              } catch (error) {
                console.error('[GeofenceMap] Error fetching profile:', error);
              }
            }
            
            // If we have geofence_id, fetch geofence directly
            if (officer.geofence_id) {
              fetchGeofence();
            } else {
              console.warn('[GeofenceMap] Cannot refresh - geofence_id not found in profile either');
            }
          }}
        >
          <Text style={styles.menuIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Leaflet Map */}
      <WebView
        ref={webViewRef}
        key={`map-${geofence?.geofence_id || 'no-geofence'}-${isLoading ? 'loading' : 'loaded'}`}
        source={{ html: getLeafletMapHTML(mapCenter, geofence, currentLocation) }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onLoadEnd={() => {
          // Inject geofence polygon after map loads if geofence data arrives later
          if (geofence && geofence.coordinates && geofence.coordinates.length > 0 && webViewRef.current) {
            const geofencePolygon = JSON.stringify(
              geofence.coordinates.map(c => [c.latitude, c.longitude])
            );
            const script = `
              if (typeof L !== 'undefined' && L.map) {
                const geofenceCoords = ${geofencePolygon};
                if (geofenceCoords && geofenceCoords.length > 0) {
                  const polygon = L.polygon(geofenceCoords, {
                    color: '#2563eb',
                    fillColor: '#2563eb',
                    fillOpacity: 0.2,
                    weight: 2
                  }).addTo(map);
                  // Expand bounds by 200 meters to show surrounding area
                  const bounds = polygon.getBounds();
                  const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
                  const centerLng = (bounds.getEast() + bounds.getWest()) / 2;
                  
                  // 200m in degrees: approximately 0.0018 degrees latitude
                  // For longitude, it varies by latitude: 0.0018 / cos(latitude)
                  const latOffset = 0.0018; // ~200m
                  const lngOffset = 0.0018 / Math.cos(centerLat * Math.PI / 180); // ~200m adjusted for latitude
                  
                  // Expand bounds by 1km in all directions
                  const expandedBounds = L.latLngBounds(
                    [bounds.getSouth() - latOffset, bounds.getWest() - lngOffset],
                    [bounds.getNorth() + latOffset, bounds.getEast() + lngOffset]
                  );
                  
                  // Fit map to expanded bounds
                  map.fitBounds(expandedBounds, {
                    padding: [20, 20], // Small padding for UI elements
                    maxZoom: 15 // Maximum zoom level
                  });
                  
                  // Ensure minimum zoom level for better context
                  if (map.getZoom() > 15) {
                    map.setZoom(15);
                  }
                  console.log('Geofence polygon added:', geofenceCoords);
                }
              }
            `;
            setTimeout(() => {
              webViewRef.current?.injectJavaScript(script);
            }, 500);
          }
        }}
      />

      <MapControls
        showZoomControls={false}
        onRecenter={() => {
          if (webViewRef.current && mapCenter) {
            webViewRef.current.injectJavaScript(`
              if (window.recenter) window.recenter(${mapCenter.lat}, ${mapCenter.lng});
            `);
          }
        }}
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoHeader}>YOUR ASSIGNED AREA</Text>
        {isLoading ? (
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.areaName}>Loading area details...</Text>
            </View>
          </View>
        ) : geofence ? (
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
                <Text style={styles.statText}>🔴 {allAlerts.filter((a) => a.priority === 'high').length} Emergency</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statText}>🟡 {allAlerts.filter((a) => a.status === 'pending').length} Pending</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statText}>🟢 {allAlerts.filter((a) => a.status === 'completed').length} Completed</Text>
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

// Generate Leaflet map HTML
const getLeafletMapHTML = (
  center: { lat: number; lng: number },
  geofence: GeofenceArea | null,
  location: { latitude: number; longitude: number; accuracy?: number } | null
) => {
  // Log what we're generating
  console.log('[GeofenceMap] Generating map HTML:', {
    center,
    hasGeofence: !!geofence,
    geofenceName: geofence?.name,
    coordinatesCount: geofence?.coordinates?.length || 0,
    hasLocation: !!location
  });
  
  // Handle coordinates - check if they're already in [lat, lng] format or {latitude, longitude} format
  let geofencePolygon = '[]';
  if (geofence?.coordinates && geofence.coordinates.length > 0) {
    try {
      // Check if coordinates are in array format [lat, lng] or object format {latitude, longitude}
      const firstCoord = geofence.coordinates[0];
      if (Array.isArray(firstCoord)) {
        // Already in [lat, lng] format
        geofencePolygon = JSON.stringify(geofence.coordinates);
      } else if (firstCoord && typeof firstCoord === 'object' && 'latitude' in firstCoord) {
        // In {latitude, longitude} format - convert to [lat, lng]
        geofencePolygon = JSON.stringify(
          geofence.coordinates.map((c: any) => [c.latitude, c.longitude])
        );
      }
      console.log('[GeofenceMap] Geofence polygon coordinates:', geofencePolygon);
    } catch (error) {
      console.error('[GeofenceMap] Error processing coordinates:', error);
    }
  }
  
  const userLocation = location 
    ? `[${location.latitude}, ${location.longitude}]`
    : 'null';
  const userAccuracy = location?.accuracy || 50; // Default to 50 meters if not available

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
    const geofenceCoords = ${geofencePolygon};
    const userLoc = ${userLocation};
    const userAccuracy = ${userAccuracy}; // GPS accuracy in meters
    
    // Initialize map with a reasonable zoom level
    // Zoom level 13 shows good detail without being too close
    const map = L.map('map').setView(center, 13);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Add geofence polygon if exists
    if (geofenceCoords && geofenceCoords.length > 0) {
      const geofencePolygon = L.polygon(geofenceCoords, {
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map);
      
      // Expand bounds by 200 meters (approximately 0.0018 degrees) to show surrounding area
      const bounds = geofencePolygon.getBounds();
      const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
      const centerLng = (bounds.getEast() + bounds.getWest()) / 2;
      
      // 200m in degrees: approximately 0.0018 degrees latitude
      // For longitude, it varies by latitude: 0.0018 / cos(latitude)
      const latOffset = 0.0018; // ~200m
      const lngOffset = 0.0018 / Math.cos(centerLat * Math.PI / 180); // ~200m adjusted for latitude
      
      // Expand bounds by 1km in all directions
      const expandedBounds = L.latLngBounds(
        [bounds.getSouth() - latOffset, bounds.getWest() - lngOffset],
        [bounds.getNorth() + latOffset, bounds.getEast() + lngOffset]
      );
      
      // Fit map to expanded bounds
      map.fitBounds(expandedBounds, {
        padding: [20, 20], // Small padding for UI elements
        maxZoom: 15 // Maximum zoom level
      });
      
      // Ensure minimum zoom level for better context
      if (map.getZoom() > 15) {
        map.setZoom(15);
      }
    }
    
    // Add user location marker and accuracy circle if available
    let userMarker = null;
    let accuracyCircle = null;
    if (userLoc) {
      // Add accuracy circle first (so marker appears on top)
      accuracyCircle = L.circle(userLoc, {
        radius: userAccuracy,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map);
      accuracyCircle.bindPopup('GPS Accuracy: ±' + Math.round(userAccuracy) + ' meters');
      
      // Add user location marker
      userMarker = L.marker(userLoc, {
        icon: L.divIcon({
          className: 'user-marker',
          html: '<div style="font-size: 30px;">📍</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })
      }).addTo(map);
      userMarker.bindPopup('Your Location (Accuracy: ±' + Math.round(userAccuracy) + 'm)');
    }
    
    // Map control functions
    window.zoomIn = function() {
      map.zoomIn();
    };
    
    window.zoomOut = function() {
      map.zoomOut();
    };
    
    window.recenter = function(lat, lng) {
      map.setView([lat, lng], map.getZoom());
    };
    
    window.updateMapCenter = function(lat, lng) {
      map.setView([lat, lng], map.getZoom());
    };
    
    // Update user location marker and accuracy circle
    window.updateUserLocation = function(lat, lng, accuracy) {
      const newLocation = [lat, lng];
      const accuracyRadius = accuracy || 50; // Default to 50m if not provided
      
      if (userMarker) {
        userMarker.setLatLng(newLocation);
        userMarker.setPopupContent('Your Location (Accuracy: ±' + Math.round(accuracyRadius) + 'm)');
      } else {
        // Create accuracy circle if it doesn't exist
        if (!accuracyCircle) {
          accuracyCircle = L.circle(newLocation, {
            radius: accuracyRadius,
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 5'
          }).addTo(map);
        } else {
          accuracyCircle.setLatLng(newLocation);
          accuracyCircle.setRadius(accuracyRadius);
        }
        accuracyCircle.setPopupContent('GPS Accuracy: ±' + Math.round(accuracyRadius) + ' meters');
        
        // Create marker if it doesn't exist
        userMarker = L.marker(newLocation, {
          icon: L.divIcon({
            className: 'user-marker',
            html: '<div style="font-size: 30px;">📍</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          })
        }).addTo(map);
        userMarker.bindPopup('Your Location (Live - Accuracy: ±' + Math.round(accuracyRadius) + 'm)');
      }
      
      // Update accuracy circle
      if (accuracyCircle) {
        accuracyCircle.setLatLng(newLocation);
        accuracyCircle.setRadius(accuracyRadius);
      } else {
        // Create accuracy circle if it doesn't exist
        accuracyCircle = L.circle(newLocation, {
          radius: accuracyRadius,
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 5'
        }).addTo(map);
        accuracyCircle.bindPopup('GPS Accuracy: ±' + Math.round(accuracyRadius) + ' meters');
      }
      
      // Optionally pan to location (commented out to avoid jarring movement)
      // map.panTo(newLocation, { animate: true, duration: 1 });
    };
  </script>
</body>
</html>
  `;
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

