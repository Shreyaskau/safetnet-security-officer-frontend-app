import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../utils';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLayerToggle?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLayerToggle,
}) => {
  return (
    <View style={styles.container}>
      {onLayerToggle && (
        <TouchableOpacity style={styles.controlButton} onPress={onLayerToggle}>
          <Text style={styles.icon}>◊</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.controlButton} onPress={onZoomIn}>
        <Text style={styles.icon}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.controlButton} onPress={onZoomOut}>
        <Text style={styles.icon}>−</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.controlButton} onPress={onRecenter}>
        <Text style={styles.icon}>⌖</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.base,
    top: spacing.xl,
    gap: spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    fontSize: 20,
    color: colors.darkText,
    fontWeight: '600',
  },
});












