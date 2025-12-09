import Geolocation from '@react-native-community/geolocation';
import { Location } from '../types/location.types';
import { locationService } from '../api/services/locationService';

export class LocationService {
  private watchId: number | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  startTracking(
    securityId: string,
    geofenceId: string,
    onLocationUpdate?: (location: Location) => void
  ) {
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

  getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }
}

export const locationServiceInstance = new LocationService();












