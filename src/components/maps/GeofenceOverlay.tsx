import React from 'react';
import { Polygon } from 'react-native-maps';
import { GeofenceArea } from '../../types/location.types';
import { colors } from '../../utils';

interface GeofenceOverlayProps {
  geofence: GeofenceArea;
}

export const GeofenceOverlay: React.FC<GeofenceOverlayProps> = ({ geofence }) => {
  const coordinates = geofence.coordinates.map((coord) => ({
    latitude: coord.latitude,
    longitude: coord.longitude,
  }));

  return (
    <Polygon
      coordinates={coordinates}
      strokeColor={colors.primary}
      fillColor={`${colors.primary}33`} // 20% opacity
      strokeWidth={2}
    />
  );
};












