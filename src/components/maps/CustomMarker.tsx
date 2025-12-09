import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors, typography, spacing } from '../../utils';

interface CustomMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  type?: 'officer' | 'user' | 'emergency';
  label?: string;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({
  coordinate,
  title,
  type = 'user',
  label,
}) => {
  const getMarkerColor = () => {
    switch (type) {
      case 'officer':
        return colors.primary;
      case 'emergency':
        return colors.emergencyRed;
      default:
        return colors.infoBlue;
    }
  };

  return (
    <Marker coordinate={coordinate} title={title}>
      <View style={[styles.markerContainer, { backgroundColor: getMarkerColor() }]}>
        <View style={styles.markerIcon}>
          <Text style={styles.iconText}>
            {type === 'officer' ? '🛡️' : type === 'emergency' ? '🚨' : '👤'}
          </Text>
        </View>
        {label && (
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
        )}
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  labelContainer: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: colors.darkBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    minWidth: 60,
  },
  labelText: {
    ...typography.caption,
    color: colors.white,
    textAlign: 'center',
  },
});












