import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../utils';

interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRecenter: () => void;
  onLayerToggle?: () => void;
  showZoomControls?: boolean; // New prop to control zoom button visibility
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLayerToggle,
  showZoomControls = false, // Default to false to hide zoom buttons
}) => {
  return (
    <View style={styles.container}>
      {onLayerToggle && (
        <TouchableOpacity style={styles.controlButton} onPress={onLayerToggle}>
          <Text style={styles.icon}>◊</Text>
        </TouchableOpacity>
      )}
      {showZoomControls && onZoomIn && (
        <TouchableOpacity style={styles.controlButton} onPress={onZoomIn}>
          <Text style={styles.icon}>+</Text>
        </TouchableOpacity>
      )}
      {showZoomControls && onZoomOut && (
        <TouchableOpacity style={styles.controlButton} onPress={onZoomOut}>
          <Text style={styles.icon}>−</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.controlButton} onPress={onRecenter}>
        <Text style={styles.icon}>📍</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.base, // Align with Leaflet's zoom controls (typically 16px from right)
    bottom: 220, // Position above info card (info card is ~200px tall, so 220px keeps button visible)
    gap: spacing.sm,
    zIndex: 1000, // Ensure it's above other elements including WebView
    elevation: 10, // Android elevation
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  icon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
  },
});












