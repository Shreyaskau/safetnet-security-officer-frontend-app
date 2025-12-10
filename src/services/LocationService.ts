import Geolocation from 'react-native-geolocation-service';
import { Location } from '../types/location.types';
import { locationService } from '../api/services/locationService';
import { requestLocationPermission } from '../utils/permissions';
import { requestLocationPermission } from '../utils/permissions';

export class LocationService {
  private watchId: number | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  async startTracking(
    securityId: string,
    geofenceId: string,
    onLocationUpdate?: (location: Location) => void
  ) {
    // Request permission first
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.error('Location permission denied');
      return;
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

        // Update server every 5 seconds
        if (this.updateInterval === null) {
          this.updateInterval = setInterval(() => {
            locationService.updateLocation(securityId, location, geofenceId).catch(
              (err) => {
                console.error('Error updating location:', err);
              }
            );
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

  stopTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async getCurrentLocation(): Promise<Location> {
    // Request permission first
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    // Use callback-based API for better compatibility
    const position = await new Promise<Geolocation.GeoPosition>((resolve, reject) => {
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












