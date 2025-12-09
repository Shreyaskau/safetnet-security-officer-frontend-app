import React from 'react';
import { Polyline } from 'react-native-maps';
import { Location } from '../../types/location.types';
import { colors } from '../../utils';

interface RoutePolylineProps {
  origin: Location;
  destination: Location;
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({
  origin,
  destination,
  color = colors.primary,
  strokeWidth = 3,
  dashed = true,
}) => {
  const coordinates = [
    { latitude: origin.latitude, longitude: origin.longitude },
    { latitude: destination.latitude, longitude: destination.longitude },
  ];

  return (
    <Polyline
      coordinates={coordinates}
      strokeColor={color}
      strokeWidth={strokeWidth}
      lineDashPattern={dashed ? [10, 5] : undefined}
    />
  );
};












