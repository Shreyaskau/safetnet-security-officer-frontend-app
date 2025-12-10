import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { BroadcastAlertPayload } from '../../types/alert.types';
import { ENABLE_API_CALLS } from '../config';
import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from '../../utils/permissions';
import { Platform, PermissionsAndroid } from 'react-native';

export const broadcastService = {
  sendBroadcast: async (payload: BroadcastAlertPayload & { location_lat?: number; location_long?: number }) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
      return { result: 'success', msg: 'Broadcast sent (mock mode)' };
    }

    // Get current location if not provided
    let latitude = payload.location_lat;
    let longitude = payload.location_long;

    // If location not provided, get current location
    if (!latitude || !longitude) {
      try {
        // Request permission first
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          throw new Error('Location permission denied');
        }

        // Get current position using callback-based API wrapped in Promise
        const position = await new Promise<Geolocation.GeoPosition>((resolve, reject) => {
          try {
            Geolocation.getCurrentPosition(
              (pos) => {
                try {
                  // Validate position object thoroughly with safe property access
                  if (!pos || typeof pos !== 'object') {
                    reject(new Error('Position object is null, undefined, or not an object'));
                    return;
                  }
                  
                  // Use optional chaining to safely check coords
                  const coords = pos?.coords;
                  if (!coords || typeof coords !== 'object') {
                    reject(new Error('Position coords property is missing or not an object'));
                    return;
                  }
                  
                  // Safely access coordinates
                  const lat = coords?.latitude;
                  const lon = coords?.longitude;
                  
                  if (lat === undefined || lon === undefined) {
                    reject(new Error(`Coordinates are undefined: lat=${lat}, lon=${lon}`));
                    return;
                  }
                  
                  if (typeof lat !== 'number' || typeof lon !== 'number') {
                    reject(new Error(`Latitude or longitude is not a number: lat=${typeof lat}, lon=${typeof lon}`));
                    return;
                  }
                  
                  if (isNaN(lat) || isNaN(lon)) {
                    reject(new Error(`Latitude or longitude is NaN: lat=${lat}, lon=${lon}`));
                    return;
                  }
                  
                  // Position is valid - resolve with the validated position
                  resolve(pos);
                } catch (validationError: any) {
                  const errorMsg = validationError?.message || String(validationError) || 'Unknown validation error';
                  reject(new Error(`Position validation failed: ${errorMsg}`));
                }
              },
              (error) => {
                // Handle geolocation error
                const errorCode = error?.code || 'UNKNOWN';
                const errorMessage = error?.message || 'Location request failed';
                reject(new Error(`Geolocation error (${errorCode}): ${errorMessage}`));
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                showLocationDialog: true,
                forceRequestLocation: true,
              }
            );
          } catch (apiError: any) {
            reject(new Error(`Geolocation API error: ${apiError?.message || 'Failed to call getCurrentPosition'}`));
          }
        });
        
        // Additional validation after Promise resolves - use safe property access
        if (!position || typeof position !== 'object') {
          throw new Error('Position is null, undefined, or not an object');
        }
        
        // Use optional chaining and validate safely
        const coords = position?.coords;
        if (!coords || typeof coords !== 'object') {
          throw new Error('Position.coords is missing or not an object');
        }
        
        // Safely access coordinates
        const lat = coords?.latitude;
        const lon = coords?.longitude;
        
        if (lat === undefined || lon === undefined) {
          throw new Error(`Coordinates are undefined: lat=${lat}, lon=${lon}`);
        }
        
        if (typeof lat !== 'number' || typeof lon !== 'number') {
          throw new Error(`Invalid coordinate types: lat=${typeof lat}, lon=${typeof lon}`);
        }
        
        if (isNaN(lat) || isNaN(lon)) {
          throw new Error(`Coordinates are NaN: lat=${lat}, lon=${lon}`);
        }
        
        latitude = lat;
        longitude = lon;
        
      } catch (error: any) {
        // Log detailed error information
        console.error('Failed to get location for broadcast:', {
          error,
          errorType: typeof error,
          errorMessage: error?.message,
          errorCode: error?.code,
          stack: error?.stack,
        });
        
        // Provide user-friendly error message
        let errorMessage = 'Unable to get current location';
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.code) {
          errorMessage = `Location error (code: ${error.code})`;
        }
        
        throw new Error(`Location access failed: ${errorMessage}`);
      }
    }

    // Use documented SOS endpoint to create/send alert
    // POST /api/security/sos/ - Create new SOS alert (for broadcasting)
    // Map broadcast payload to SOS alert format
    const sosPayload: any = {
      security_id: payload.security_id,
      geofence_id: payload.geofence_id,
      message: payload.message,
      alert_type: payload.alert_type === 'general' ? 'normal' : 
                  payload.alert_type === 'warning' ? 'emergency' : 'normal',
      location_lat: latitude.toString(), // Required field - must be string
      location_long: longitude.toString(), // Required field - must be string
      status: 'pending',
    };

    // Priority field - backend might expect specific values
    // Try common choices: 'low', 'medium', 'high' or numeric
    // Based on error saying "normal" is invalid, using 'high' or 'low'
    if (payload.priority) {
      sosPayload.priority = 'high'; // High priority
    } else {
      sosPayload.priority = 'low'; // Low priority
    }

    const response = await axiosInstance.post(
      API_ENDPOINTS.LIST_SOS, // POST /api/security/sos/ creates new SOS alert
      sosPayload
    );
    return response.data;
  },
};














