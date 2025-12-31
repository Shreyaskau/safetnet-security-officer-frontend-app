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
    // User selects: 'general' (General Notice), 'warning', 'emergency'
    const alertTypeMapping: Record<string, string> = {
      'emergency': 'emergency',
      'general': 'normal', // 'general' (General Notice) maps to 'normal' for backend
      'warning': 'emergency', // 'warning' maps to 'emergency' for backend
    };
    
    const mappedAlertType = alertTypeMapping[payload.alert_type] || 'normal';
    
    const sosPayload: any = {
      security_id: payload.security_id,
      message: payload.message,
      alert_type: mappedAlertType, // Backend expects: 'emergency' or 'normal'
      original_alert_type: payload.alert_type, // Preserve original: 'general' (General Notice), 'warning', 'emergency'
      location_lat: latitude.toString(), // Required field - must be string
      location_long: longitude.toString(), // Required field - must be string
      status: 'pending',
    };
    
    // Backend might expect 'geofence' instead of 'geofence_id', or integer instead of string
    // Try multiple formats to ensure backend accepts it
    if (payload.geofence_id && payload.geofence_id !== '' && payload.geofence_id !== '0') {
      // If geofence_id is numeric, try as integer
      if (!isNaN(Number(payload.geofence_id))) {
        const geofenceIdNum = Number(payload.geofence_id);
        // Try both field names and both formats
        sosPayload.geofence_id = geofenceIdNum; // Integer format
        sosPayload.geofence = geofenceIdNum; // Also try 'geofence' field name
        sosPayload.geofence_id_str = payload.geofence_id; // String format as backup
        console.log('[BroadcastService] Adding geofence as integer:', geofenceIdNum, '(also as string:', payload.geofence_id, ')');
      } else {
        // If not numeric, keep as string
        sosPayload.geofence_id = payload.geofence_id;
        sosPayload.geofence = payload.geofence_id;
        console.log('[BroadcastService] Adding geofence as string:', payload.geofence_id);
      }
    }
    
    // Debug: Log the payload being sent
    console.log('[BroadcastService] Sending alert:', {
      alert_type_input: payload.alert_type,
      alert_type_mapped: mappedAlertType,
      message: payload.message.substring(0, 50) + '...',
      hasLocation: !!latitude && !!longitude,
      geofence_id: payload.geofence_id
    });

    // Priority field - backend might expect specific values
    // Try common choices: 'low', 'medium', 'high' or numeric
    // Based on error saying "normal" is invalid, using 'high' or 'low'
    if (payload.priority) {
      sosPayload.priority = 'high'; // High priority
    } else {
      sosPayload.priority = 'low'; // Low priority
    }

    // Log full payload for debugging
    console.log('[BroadcastService] Full SOS payload:', JSON.stringify(sosPayload, null, 2));
    
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.LIST_SOS, // POST /api/security/sos/ creates new SOS alert
        sosPayload
      );
      
      // Log response to verify alert was created
      const alertId = response.data?.id || response.data?.log_id || response.data?.sos_id;
      const originalType = payload.alert_type; // 'general', 'warning', or 'emergency'
      
      console.log('[BroadcastService] ✅ SOS alert created successfully:', {
        status: response.status,
        statusText: response.statusText,
        alertId: alertId,
        original_alert_type_sent: originalType,
        original_alert_type_in_response: response.data?.original_alert_type,
        alert_type_in_response: response.data?.alert_type,
        fullResponse: JSON.stringify(response.data, null, 2),
      });
      
      // Store the original alert type mapping locally if backend doesn't return it
      // This ensures we can always show the exact type the user selected
      if (alertId && originalType) {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const alertTypeMapKey = `alert_type_map_${alertId}`;
          await AsyncStorage.setItem(alertTypeMapKey, originalType);
          console.log('[BroadcastService] Stored original_alert_type locally:', { alertId, originalType });
        } catch (storageError) {
          console.warn('[BroadcastService] Failed to store original_alert_type locally:', storageError);
        }
      }
      
      // Ensure original_alert_type is preserved in response
      // If backend doesn't return it, add it to the response data
      if (alertId && !response.data.original_alert_type) {
        response.data.original_alert_type = originalType;
        console.log('[BroadcastService] Added original_alert_type to response:', originalType);
      }
      
      return response.data;
    } catch (error: any) {
      // Log detailed error information
      console.error('[BroadcastService] ❌ Failed to create SOS alert:', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        payload: JSON.stringify(sosPayload, null, 2),
      });
      
      // Re-throw with more context
      throw new Error(
        `Failed to send broadcast: ${error.response?.data?.message || error.message || 'Unknown error'}`
      );
    }
  },
};














