import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermissionWithCheck } from '../utils/permissions';

export default function LeafletMapScreen({ route, navigation }) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false); // Area selection mode
  const [selectedArea, setSelectedArea] = useState(null); // Selected area coordinates
  const webViewRef = useRef(null);
  const watchIdRef = useRef(null);
  
  // Get initial params if navigating from another screen
  const enableSelection = route?.params?.enableSelection || false;

  const updateMapLocation = (lat, lng) => {
    if (webViewRef.current && lat && lng) {
      // Send location update to WebView
      const script = `
        if (window.updateLocation) {
          window.updateLocation(${lat}, ${lng});
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const startLiveTracking = async () => {
    try {
      // Request permission
      const hasPermission = await requestLocationPermissionWithCheck(true);
      
      if (!hasPermission) {
        throw new Error('Location permission denied or location services disabled.');
      }

      // Check if Geolocation is available
      if (!Geolocation || typeof Geolocation.watchPosition !== 'function') {
        throw new Error('Location service not available. Please rebuild the app.');
      }

      console.log('[LeafletMap] Starting live location tracking...');
      setIsTracking(true);
      setError(null);

      // Start watching position
      watchIdRef.current = Geolocation.watchPosition(
        (position) => {
          if (position && position.coords) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
              // Update position state
              setPosition({ lat, lng });
              
              // Update map marker in real-time
              updateMapLocation(lat, lng);
              
              setIsLoading(false);
            }
          }
        },
        (error) => {
          console.error('[LeafletMap] Location tracking error:', error);
          setError(`Location tracking error: ${error.message || 'Unknown error'}`);
          
          // If we have a previous position, keep using it
          if (!position) {
            setIsLoading(false);
          }
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10, // Update every 10 meters
          interval: 5000, // Update every 5 seconds
          fastestInterval: 2000, // Fastest update every 2 seconds
          showLocationDialog: true,
          forceRequestLocation: true,
        }
      );
    } catch (e) {
      console.error('[LeafletMap] Error starting live tracking:', e);
      setError(e.message || 'Failed to start live location tracking');
      setIsLoading(false);
      
      // Show alert
      Alert.alert(
        'Location Tracking Error',
        e.message || 'Failed to start live location tracking. Please check your location settings.',
        [
          { text: 'Use Default Location', onPress: () => setPosition({ lat: 19.0760, lng: 72.8777 }) },
          { text: 'Retry', onPress: startLiveTracking }
        ]
      );
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
    }
  };

  useEffect(() => {
    // Enable selection mode if passed as param
    if (enableSelection) {
      setSelectionMode(true);
    }
  }, [enableSelection]);

  useEffect(() => {
    // Start live tracking when component mounts
    startLiveTracking();
    
    // Cleanup: stop tracking when component unmounts
    return () => {
      stopTracking();
    };
  }, []);

  const toggleSelectionMode = () => {
    const newMode = !selectionMode;
    setSelectionMode(newMode);
    
    if (webViewRef.current) {
      const script = `
        if (window.toggleSelectionMode) {
          window.toggleSelectionMode(${newMode});
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const clearSelectedArea = () => {
    setSelectedArea(null);
    if (webViewRef.current) {
      const script = `
        if (window.clearSelectedArea) {
          window.clearSelectedArea();
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const getSelectedAreaCoordinates = () => {
    if (webViewRef.current) {
      const script = `
        if (window.getSelectedArea) {
          const area = window.getSelectedArea();
          if (area) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'AREA_SELECTED',
              data: area
            }));
          }
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  if (!position) {
    return (
      <View style={styles.loadingContainer}>
        {isLoading ? (
          <>
            <Text style={styles.loadingText}>Requesting location permission...</Text>
            <Text style={styles.loadingSubtext}>Please grant permission to show your location</Text>
          </>
        ) : (
          <>
            <Text style={styles.errorTitle}>Unable to get location</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={startLiveTracking}
            >
              <Text style={styles.retryButtonText}>Start Live Tracking</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.useDefaultButton} 
              onPress={() => setPosition({ lat: 19.0760, lng: 72.8777 })}
            >
              <Text style={styles.useDefaultButtonText}>Use Default Location</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  // Create HTML for Leaflet map with live location and area selection support
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
    .location-indicator {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(37, 99, 235, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .leaflet-draw-toolbar {
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="location-indicator" id="locationStatus">
    📍 Live Tracking
  </div>
  <script>
    let map, userMarker, accuracyCircle;
    let drawControl, drawnItems;
    let selectedAreaData = null;
    const initialLat = ${position?.lat || 19.0760};
    const initialLng = ${position?.lng || 72.8777};
    const selectionModeEnabled = ${selectionMode};
    
    // Initialize map
    map = L.map('map').setView([initialLat, initialLng], 15);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Initialize the draw feature
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    // Configure draw control options
    const drawControlOptions = {
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: {
            color: '#e1e100',
            message: '<strong>Oh snap!<strong> you can\'t draw that!'
          },
          shapeOptions: {
            color: '#2563eb',
            fillColor: '#2563eb',
            fillOpacity: 0.2
          }
        },
        polyline: false,
        rectangle: {
          shapeOptions: {
            color: '#2563eb',
            fillColor: '#2563eb',
            fillOpacity: 0.2
          }
        },
        circle: {
          shapeOptions: {
            color: '#2563eb',
            fillColor: '#2563eb',
            fillOpacity: 0.2
          }
        },
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    };
    
    drawControl = new L.Control.Draw(drawControlOptions);
    
    // Enable draw control if selection mode is enabled
    if (selectionModeEnabled) {
      map.addControl(drawControl);
    }
    
    // Handle draw events
    map.on(L.Draw.Event.CREATED, function (e) {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      
      // Get area data
      let areaData = {
        type: layer instanceof L.Polygon ? 'polygon' : 
              layer instanceof L.Rectangle ? 'rectangle' : 
              layer instanceof L.Circle ? 'circle' : 'unknown',
        coordinates: []
      };
      
      if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        const latlngs = layer.getLatLngs()[0];
        areaData.coordinates = latlngs.map(latLng => ({
          lat: latLng.lat,
          lng: latLng.lng
        }));
        // Calculate area using simple shoelace formula
        let area = 0;
        for (let i = 0; i < latlngs.length; i++) {
          const j = (i + 1) % latlngs.length;
          area += latlngs[i].lng * latlngs[j].lat;
          area -= latlngs[j].lng * latlngs[i].lat;
        }
        area = Math.abs(area) / 2;
        // Convert to square meters (rough approximation)
        areaData.area = area * 111000 * 111000; // degrees to meters
      } else if (layer instanceof L.Circle) {
        const center = layer.getLatLng();
        const radius = layer.getRadius();
        areaData.center = { lat: center.lat, lng: center.lng };
        areaData.radius = radius;
        areaData.area = Math.PI * radius * radius;
      }
      
      selectedAreaData = areaData;
      
      // Send to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'AREA_SELECTED',
          data: areaData
        }));
      }
      
      // Show area info in popup
      const areaInKm2 = (areaData.area / 1000000).toFixed(2);
      layer.bindPopup('Selected Area: ' + areaInKm2 + ' km²').openPopup();
    });
    
    map.on(L.Draw.Event.DELETED, function (e) {
      selectedAreaData = null;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'AREA_CLEARED'
        }));
      }
    });
    
    // Create custom icon for user location
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div style="font-size: 30px;">📍</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });
    
    // Add user marker
    userMarker = L.marker([initialLat, initialLng], {
      icon: userIcon
    }).addTo(map);
    
    // Bind popup
    userMarker.bindPopup('Your Location<br>Live Tracking Active').openPopup();
    
    // Accuracy circle (optional, if accuracy data is available)
    function updateAccuracyCircle(lat, lng, accuracy) {
      if (accuracyCircle) {
        map.removeLayer(accuracyCircle);
      }
      if (accuracy && accuracy > 0) {
        accuracyCircle = L.circle([lat, lng], {
          radius: accuracy,
          fillColor: '#3388ff',
          fillOpacity: 0.2,
          color: '#3388ff',
          weight: 1
        }).addTo(map);
      }
    }
    
    // Function to update location (called from React Native)
    window.updateLocation = function(lat, lng, accuracy) {
      if (!map || !userMarker) return;
      
      // Update marker position
      userMarker.setLatLng([lat, lng]);
      
      // Pan map to new location (smoothly)
      map.panTo([lat, lng], { animate: true, duration: 1 });
      
      // Update accuracy circle if accuracy provided
      if (accuracy) {
        updateAccuracyCircle(lat, lng, accuracy);
      }
      
      // Update popup with timestamp
      const now = new Date().toLocaleTimeString();
      userMarker.setPopupContent('Your Location<br>Updated: ' + now);
      
      // Flash indicator
      const statusEl = document.getElementById('locationStatus');
      if (statusEl) {
        statusEl.classList.add('pulse');
        setTimeout(() => statusEl.classList.remove('pulse'), 500);
      }
    };
    
    // Toggle selection mode
    window.toggleSelectionMode = function(enabled) {
      if (enabled) {
        if (!map.hasControl(drawControl)) {
          map.addControl(drawControl);
        }
      } else {
        if (map.hasControl(drawControl)) {
          map.removeControl(drawControl);
          drawnItems.clearLayers();
          selectedAreaData = null;
        }
      }
    };
    
    // Clear selected area
    window.clearSelectedArea = function() {
      drawnItems.clearLayers();
      selectedAreaData = null;
    };
    
    // Get selected area
    window.getSelectedArea = function() {
      return selectedAreaData;
    };
    
    // Initialize accuracy circle if needed
    updateAccuracyCircle(initialLat, initialLng, 50);
  </script>
</body>
</html>
  `;

  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'AREA_SELECTED') {
        setSelectedArea(message.data);
        console.log('[LeafletMap] Area selected:', message.data);
        
        // Show alert with area info
        const areaInKm2 = (message.data.area / 1000000).toFixed(2);
        Alert.alert(
          'Area Selected',
          `Area: ${areaInKm2} km²\nType: ${message.data.type}`,
          [
            { text: 'OK' },
            { 
              text: 'Use This Area', 
              onPress: () => {
                // You can pass this back via navigation params or callback
                if (navigation && route?.params?.onAreaSelected) {
                  route.params.onAreaSelected(message.data);
                  navigation.goBack();
                }
              }
            }
          ]
        );
      } else if (message.type === 'AREA_CLEARED') {
        setSelectedArea(null);
        console.log('[LeafletMap] Area cleared');
      }
    } catch (error) {
      console.log('[LeafletMap] Message from WebView:', event.nativeEvent.data);
    }
  };

  return (
    <View style={styles.container}>
      {isTracking && position && (
        <View style={styles.trackingIndicator}>
          <Text style={styles.trackingText}>📍 Live Location Tracking Active</Text>
        </View>
      )}
      
      {selectionMode && (
        <View style={styles.selectionControls}>
          <Text style={styles.selectionModeText}>✏️ Draw area on map</Text>
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={clearSelectedArea}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onMessage={handleWebViewMessage}
      />
      
      {/* Floating action buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, selectionMode && styles.fabActive]}
          onPress={toggleSelectionMode}
        >
          <Text style={styles.fabText}>{selectionMode ? '✓' : '📐'}</Text>
        </TouchableOpacity>
        {selectedArea && (
          <TouchableOpacity
            style={[styles.fab, styles.fabInfo]}
            onPress={getSelectedAreaCoordinates}
          >
            <Text style={styles.fabText}>ℹ️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  trackingIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    padding: 8,
    borderRadius: 6,
    zIndex: 1000,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  trackingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  loadingText: { 
    fontSize: 18, 
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  errorTitle: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center'
  },
  errorText: { 
    fontSize: 14, 
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    minWidth: 150
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  useDefaultButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150
  },
  useDefaultButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center'
  },
  selectionControls: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectionModeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabActive: {
    backgroundColor: '#10b981',
  },
  fabInfo: {
    backgroundColor: '#f59e0b',
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
  },
});
