import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { colors } from '../../utils';

interface SecurityMapProps {
  initialRegion?: Region;
  style?: ViewStyle;
  children?: React.ReactNode;
  onRegionChangeComplete?: (region: Region) => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  zoomEnabled?: boolean;
  scrollEnabled?: boolean;
  rotateEnabled?: boolean;
}

export const SecurityMap: React.FC<SecurityMapProps> = ({
  initialRegion,
  style,
  children,
  onRegionChangeComplete,
  showsUserLocation = true,
  showsMyLocationButton = true,
  showsCompass = true,
  zoomEnabled = true,
  scrollEnabled = true,
  rotateEnabled = true,
}) => {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={[styles.map, style]}
      initialRegion={initialRegion}
      onRegionChangeComplete={onRegionChangeComplete}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={showsMyLocationButton}
      showsCompass={showsCompass}
      zoomEnabled={zoomEnabled}
      scrollEnabled={scrollEnabled}
      rotateEnabled={rotateEnabled}
      mapType="standard"
      loadingEnabled
      loadingIndicatorColor={colors.primary}
    >
      {children}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});












