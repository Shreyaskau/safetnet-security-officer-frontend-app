import Geolocation from 'react-native-geolocation-service';

/**
 * Location Service
 * Provides location-related functionality using react-native-geolocation-service
 */
class LocationService {
  /**
   * Get current location
   * @returns {Promise} Promise that resolves with position object
   */
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
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

  /**
   * Watch position changes
   * @param {Function} callback - Callback function called with position updates
   * @param {Object} options - Watch options
   * @returns {Number} Watch ID for clearing the watch
   */
  watchPosition(callback, options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      distanceFilter: 10,
      interval: 5000,
      ...options,
    };

    return Geolocation.watchPosition(
      callback,
      (error) => {
        console.error('Location watch error:', error);
      },
      defaultOptions
    );
  }

  /**
   * Clear position watch
   * @param {Number} watchId - Watch ID returned from watchPosition
   */
  clearWatch(watchId) {
    if (watchId) {
      Geolocation.clearWatch(watchId);
    }
  }

  /**
   * Stop all watches
   */
  stopAllWatches() {
    // Note: react-native-geolocation-service doesn't have a stopAll method
    // You need to track watch IDs and clear them individually
    console.warn('stopAllWatches: You must track and clear watch IDs individually');
  }
}

export default new LocationService();

