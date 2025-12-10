import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WebViewLeaflet from "react-native-webview-leaflet";
import { getCurrentLocation } from '../services/locationService';

export default function LeafletMapScreen() {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    async function loadLocation() {
      try {
        const coords = await getCurrentLocation();
        setPosition({ lat: coords.coords.latitude, lng: coords.coords.longitude });
      } catch (e) {
        console.log("Location error:", e);
      }
    }
    loadLocation();
  }, []);

  if (!position) {
    return <Text style={{padding: 20}}>Getting current location...</Text>;
  }

  return (
    <View style={styles.container}>
      <WebViewLeaflet
        mapLayers={[{
          name: "OpenStreetMap",
          layerType: "tile",
          baseLayer: true,
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        }]}
        mapCenterPosition={{
          lat: position.lat,
          lng: position.lng,
        }}
        markers={[{
          id: "user",
          position: position,
          icon: "📍"
        }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});

