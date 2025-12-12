import Geolocation from 'react-native-geolocation-service';
import { Location } from '../types/location.types';
import { locationService } from '../api/services/locationService';
import { requestLocationPermission } from '../utils/permissions';

export class LocationService {
  private watchId: number | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private securityId: string | null = null;
  private geofenceId: string | null = null;

  async startTracking(
    securityId: string,
    geofenceId: string,
    onLocationUpdate?: (location: Location) => void
  ) {
    // Store IDs for cleanup
    this.securityId = securityId;
    this.geofenceId = geofenceId;

    // Request permission first
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.error('Location permission denied');
      return;
    }

    // Start live location session on backend
    try {
      // Default duration: 60 minutes (1 hour) - can be extended if needed
      await locationService.startLiveLocation(securityId, geofenceId, 60);
    } catch (error: any) {
      // Log 400 errors (validation issues) and other errors, but suppress 404
      if (error?.response?.status === 400) {
        console.error('[LocationService] Validation error starting live location:', error?.response?.data || error?.message || error);
      } else if (error?.response?.status !== 404) {
        console.warn('[LocationService] Could not start live location session:', error?.message || error);
      }
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        };

        // Update server every 5 seconds (silently fail on 404 - endpoint may not exist)
        if (this.updateInterval === null) {
          this.updateInterval = setInterval(() => {
            if (this.securityId && this.geofenceId) {
              locationService.updateLocation(this.securityId, location, this.geofenceId).catch(
                (err: any) => {
                  // Only log non-404 errors
                  if (err?.response?.status !== 404) {
                    console.error('Error updating location:', err);
                  }
                }
              );
            }
          }, 5000);
        }

        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
      }
    );
  }

  async stopTracking() {
    // Stop GPS tracking
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    // Clear update interval
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Stop live location session on backend
    if (this.securityId) {
      try {
        await locationService.stopLiveLocation(this.securityId);
      } catch (error: any) {
        // Only log non-404 errors
        if (error?.response?.status !== 404) {
          console.warn('[LocationService] Error stopping live location session:', error?.message || error);
        }
      }
      this.securityId = null;
      this.geofenceId = null;
    }
  }

  async getCurrentLocation(): Promise<Location> {
    // Check if Geolocation is available
    if (!Geolocation || typeof Geolocation.getCurrentPosition !== 'function') {
      throw new Error(
        'Location service not available. This may be due to:\n' +
        '1. App needs to be rebuilt\n' +
        '2. Native module not properly linked\n' +
        '3. Device location services disabled\n\n' +
        'Please rebuild the app and ensure location services are enabled.'
      );
    }

    // Request permission first (with device location services check)
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error(
        'Location permission denied or location services disabled.\n\n' +
        'Please:\n' +
        '1. Enable Location Services (GPS) in Device Settings\n' +
        '2. Grant location permission to the app\n' +
        '3. Try again'
      );
    }

    // Use callback-based API for better compatibility
    const position = await new Promise<Geolocation.GeoPosition>((resolve, reject) => {
      try {
      Geolocation.getCurrentPosition(
        (pos) => {
          // Validate position object
          if (pos && pos.coords && typeof pos.coords.latitude === 'number' && typeof pos.coords.longitude === 'number') {
            resolve(pos);
          } else {
            reject(new Error('Invalid location data received'));
          }
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          showLocationDialog: true,
          forceRequestLocation: true,
        }
      );
      } catch (error) {
        reject(new Error(`Location service error: ${error.message || 'Native module not available'}`));
      }
    });

    // Validate position before accessing coords
    if (!position || !position.coords) {
      throw new Error('Invalid position object received');
    }

    // Validate coordinates
    if (
      typeof position.coords.latitude !== 'number' ||
      typeof position.coords.longitude !== 'number' ||
      isNaN(position.coords.latitude) ||
      isNaN(position.coords.longitude)
    ) {
      throw new Error('Invalid coordinates received');
    }

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
      timestamp: position.timestamp,
    };
  }
}

export const locationServiceInstance = new LocationService();












