import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { Alert, AlertResponse, AcceptAlertPayload } from '../../types/alert.types';
import { getSampleAlerts } from '../../utils/sampleData';
import { ENABLE_API_CALLS } from '../config';

export const alertService = {
  getAlerts: async (securityId: string, geofenceId: string, officerName?: string): Promise<Alert[]> => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return getSampleAlerts();
    }

    // Use documented SOS endpoint instead of legacy /alerts/
    // GET /api/security/sos/ - List all SOS alerts
    // Backend might filter by security_id or geofence_id, so try with and without params
    console.log('[AlertService] Fetching alerts from:', API_ENDPOINTS.LIST_SOS);
    console.log('[AlertService] Request params:', { securityId, geofenceId, officerName });
    
    // Try multiple approaches to fetch alerts
    // Backend might filter by JWT token, security_id, geofence_id, or status
    let endpoint = API_ENDPOINTS.LIST_SOS;
    
    console.log('[AlertService] Attempting to fetch alerts with multiple strategies...');
    let response;
    let lastError: any = null;
    
    // Strategy 1: Fetch ALL alerts without any query params (backend filters by JWT token)
    try {
      console.log('[AlertService] Strategy 1: Fetching ALL alerts (no filters)...');
      response = await axiosInstance.get<AlertResponse>(endpoint);
      const alertsCount = Array.isArray(response.data) ? response.data.length : 
                         (response.data?.data?.length || response.data?.results?.length || 0);
      console.log('[AlertService] ✅ Strategy 1 success - Found', alertsCount, 'alerts');
      if (alertsCount > 0) {
        // If we got alerts, use this response
      } else {
        console.log('[AlertService] Strategy 1 returned 0 alerts, trying other strategies...');
        throw new Error('No alerts found');
      }
    } catch (error: any) {
      lastError = error;
      console.log('[AlertService] Strategy 1 failed or returned 0 alerts, trying Strategy 2...');
      
      // Strategy 2: Try with security_id only
      if (securityId && securityId !== '' && securityId !== '0') {
        try {
          const params = { security_id: securityId };
          const queryString = '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
          const fullEndpoint = endpoint + queryString;
          console.log('[AlertService] Strategy 2: Fetching with security_id:', fullEndpoint);
          response = await axiosInstance.get<AlertResponse>(fullEndpoint);
          const alertsCount = Array.isArray(response.data) ? response.data.length : 
                             (response.data?.data?.length || response.data?.results?.length || 0);
          console.log('[AlertService] ✅ Strategy 2 success - Found', alertsCount, 'alerts');
          if (alertsCount > 0) {
            // If we got alerts, use this response
          } else {
            throw new Error('No alerts found');
          }
        } catch (error2: any) {
          lastError = error2;
          console.log('[AlertService] Strategy 2 failed or returned 0 alerts, trying Strategy 3...');
        }
      }
      
      // Strategy 3: Try with geofence_id (if we have numeric ID)
      if (geofenceId && geofenceId !== '' && geofenceId !== '0' && !isNaN(Number(geofenceId))) {
        try {
          const params = { geofence_id: geofenceId };
          const queryString = '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
          const fullEndpoint = endpoint + queryString;
          console.log('[AlertService] Strategy 3: Fetching with geofence_id:', fullEndpoint);
          response = await axiosInstance.get<AlertResponse>(fullEndpoint);
          const alertsCount = Array.isArray(response.data) ? response.data.length : 
                             (response.data?.data?.length || response.data?.results?.length || 0);
          console.log('[AlertService] ✅ Strategy 3 success - Found', alertsCount, 'alerts');
          if (alertsCount > 0) {
            // If we got alerts, use this response
          } else {
            throw new Error('No alerts found');
          }
        } catch (error3: any) {
          lastError = error3;
          console.log('[AlertService] Strategy 3 failed or returned 0 alerts, trying Strategy 4...');
        }
      }
      
      // Strategy 4: Try with both security_id and geofence_id
      if (securityId && securityId !== '' && securityId !== '0' && 
          geofenceId && geofenceId !== '' && geofenceId !== '0' && !isNaN(Number(geofenceId))) {
        try {
          const params: any = { security_id: securityId };
          if (!isNaN(Number(geofenceId))) {
            params.geofence_id = geofenceId;
          }
          const queryString = '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
          const fullEndpoint = endpoint + queryString;
          console.log('[AlertService] Strategy 4: Fetching with security_id + geofence_id:', fullEndpoint);
          response = await axiosInstance.get<AlertResponse>(fullEndpoint);
          const alertsCount = Array.isArray(response.data) ? response.data.length : 
                             (response.data?.data?.length || response.data?.results?.length || 0);
          console.log('[AlertService] ✅ Strategy 4 success - Found', alertsCount, 'alerts');
        } catch (error4: any) {
          lastError = error4;
          console.log('[AlertService] Strategy 4 failed, using Strategy 1 response (even if empty)');
          // Fallback to Strategy 1 response (even if empty)
          response = await axiosInstance.get<AlertResponse>(endpoint);
        }
      } else {
        // If we don't have both params, fallback to Strategy 1
        response = await axiosInstance.get<AlertResponse>(endpoint);
      }
    }
    
    // Strategy 5: If still no alerts, try /active/ endpoint (alerts are created with status: 'pending')
    const alertsCount = Array.isArray(response.data) ? response.data.length : 
                       (response.data?.data?.length || response.data?.results?.length || 0);
    if (alertsCount === 0) {
      console.log('[AlertService] No alerts found, trying /active/ endpoint...');
      try {
        const activeResponse = await axiosInstance.get<AlertResponse>(API_ENDPOINTS.GET_ACTIVE_SOS);
        const activeCount = Array.isArray(activeResponse.data) ? activeResponse.data.length : 
                           (activeResponse.data?.data?.length || activeResponse.data?.results?.length || 0);
        if (activeCount > 0) {
          console.log('[AlertService] ✅ Found', activeCount, 'alerts in /active/ endpoint');
          response = activeResponse;
        }
      } catch (activeError: any) {
        console.log('[AlertService] /active/ endpoint also returned empty or failed:', activeError.message);
      }
    }

    console.log('[AlertService] Raw API response:', {
      status: response.status,
      statusText: response.statusText,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A',
      dataLength: Array.isArray(response.data) ? response.data.length : 
                  (response.data?.data?.length || response.data?.results?.length || 0),
    });
    
    // Log full response for debugging (truncated to avoid console spam)
    const fullResponseStr = JSON.stringify(response.data, null, 2);
    console.log('[AlertService] Full API response (first 1000 chars):', fullResponseStr.substring(0, 1000));
    if (fullResponseStr.length > 1000) {
      console.log('[AlertService] ... (response truncated, total length:', fullResponseStr.length, 'chars)');
    }

    // Handle response format - could be array or { data: [] }
    let alerts: any[] = [];
    if (Array.isArray(response.data)) {
      alerts = response.data;
      console.log('[AlertService] Response is array, length:', alerts.length);
    } else {
      alerts = response.data.data || response.data.results || [];
      console.log('[AlertService] Response is object, extracted alerts length:', alerts.length);
    }
    
    console.log('[AlertService] Raw alerts before transformation:', alerts.length > 0 ? alerts.slice(0, 2) : '[]');

    // Transform API response to match Alert interface structure
    // Backend might return location_lat/location_long instead of location object
    // Note: We'll handle async operations (like AsyncStorage) after the initial transformation
    const transformedAlerts = await Promise.all(alerts.map(async (alert: any) => {
      // Ensure ID fields exist - SOS API might use 'id' instead of 'log_id'
      if (!alert.log_id && alert.id) {
        alert.log_id = alert.id;
      }
      if (!alert.id && alert.log_id) {
        alert.id = alert.log_id;
      }
      
      // Ensure location structure exists - backend returns location_lat/location_long
      let locationData = alert.location;
      if (!locationData) {
        const lat = alert.location_lat;
        const lng = alert.location_long;
        if (lat && lng && lat !== 0 && lng !== 0) {
          // We have valid coordinates
          locationData = {
            latitude: typeof lat === 'number' ? lat : parseFloat(lat) || 0,
            longitude: typeof lng === 'number' ? lng : parseFloat(lng) || 0,
            address: alert.location_address || 
                    alert.address || 
                    (lat && lng ? `Lat: ${typeof lat === 'number' ? lat.toFixed(6) : lat}, Lng: ${typeof lng === 'number' ? lng.toFixed(6) : lng}` : 'Location not available'),
          };
        } else {
          // No valid coordinates
          locationData = {
            latitude: 0,
            longitude: 0,
            address: 'Location not available',
          };
        }
      }
      // Update alert.location for use below
      alert.location = locationData;
      
      // Extract officer's actual name (not username)
      // Backend might return: officer_name, first_name + last_name, name, user_name, username
      let userName = (alert as any).officer_name || // Preferred: explicit officer_name field
                     alert.user_name || // Common field name
                     alert.user?.name || // Nested user object
                     alert.name || // Direct name field
                     (alert.user?.first_name && alert.user?.last_name 
                       ? `${alert.user.first_name} ${alert.user.last_name}`.trim() 
                       : null) || // Combine first_name + last_name
                     (alert.first_name && alert.last_name 
                       ? `${alert.first_name} ${alert.last_name}`.trim() 
                       : null) || // Direct first_name + last_name
                     alert.user?.first_name || // Just first name
                     alert.first_name || // Direct first name
                     alert.username || // Fallback to username if no name available
                     alert.user?.username; // Nested username
      
      // If alert was created by this security officer, use their name
      // Check if security_id matches or if user_name is missing
      const isOfficerAlert = alert.security_id === securityId || 
                             alert.created_by === securityId ||
                             (!userName);
      
      // Use logged-in officer's name if it's their alert and we don't have a name
      if (!userName && isOfficerAlert && officerName) {
        userName = officerName; // Use logged-in officer's name
      }
      
      // Final fallback
      if (!userName) {
        userName = 'Unknown Officer'; // Final fallback
      }
      
      // Log for debugging
      if (alert.username && !userName.includes(alert.username) && userName === 'Unknown Officer') {
        console.log('[AlertService] Could not extract officer name, using fallback:', {
          id: alert.id || alert.log_id,
          username: alert.username,
          user_name: alert.user_name,
          officer_name: (alert as any).officer_name,
          first_name: alert.first_name || alert.user?.first_name,
          last_name: alert.last_name || alert.user?.last_name,
        });
      }
      
      // Extract alert_type from various possible field names
      // Backend might return: alert_type, alertType, type, alert_type_id, etc.
      let alertType = alert.alert_type || 
                     alert.alertType || 
                     alert.type || 
                     alert.alert_type_id ||
                     'normal'; // Default to normal if not found
      
      // Preserve original_alert_type if backend returns it (what user actually selected)
      // This is the EXACT type the user selected: 'general', 'warning', or 'emergency'
      let originalAlertType = (alert as any).original_alert_type || undefined;
      
      // If backend doesn't return original_alert_type, try to get it from local storage
      // This ensures we always show the exact type the user selected when creating the alert
      if (!originalAlertType) {
        try {
          const alertId = alert.id || alert.log_id;
          if (alertId) {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const alertTypeMapKey = `alert_type_map_${alertId}`;
            const storedType = await AsyncStorage.getItem(alertTypeMapKey);
            if (storedType && ['general', 'warning', 'emergency'].includes(storedType)) {
              originalAlertType = storedType as 'general' | 'warning' | 'emergency';
              console.log('[AlertService] Retrieved original_alert_type from local storage:', { alertId, originalAlertType });
            }
          }
        } catch (storageError) {
          // Silently fail - local storage is optional
        }
      }
      
      // Normalize alert_type values (handle case variations)
      if (typeof alertType === 'string') {
        alertType = alertType.toLowerCase();
        // Map common variations to standard values
        if (alertType === 'emergency' || alertType === 'urgent' || alertType === 'critical') {
          alertType = 'emergency';
          // If backend returns 'emergency' but no original_alert_type,
          // we can't distinguish between 'emergency' and 'warning' (both map to emergency)
          // So we default to 'emergency' (most common case)
          if (!originalAlertType) {
            originalAlertType = 'emergency';
          }
        } else if (alertType === 'normal' || alertType === 'general' || alertType === 'standard') {
          alertType = 'normal';
          // If backend returns 'normal' but no original_alert_type,
          // it's most likely 'general' (General Notice) since that's what maps to 'normal'
          if (!originalAlertType) {
            originalAlertType = 'general';
          }
        } else if (alertType === 'security' || alertType === 'security_alert') {
          alertType = 'security';
        }
      }
      
      // Log if we're missing original_alert_type for debugging
      if (!originalAlertType && alertType) {
        console.log('[AlertService] ⚠️ Missing original_alert_type for alert:', {
          id: alert.id || alert.log_id,
          alert_type: alertType,
          backend_alert_type: alert.alert_type,
        });
      }
      
      // Debug logging to help troubleshoot alert types
      if (alertType === 'emergency' || originalAlertType || alert.alert_type === 'emergency') {
        console.log('[AlertService] Alert type mapping:', {
          id: alert.id || alert.log_id,
          backend_alert_type: alert.alert_type,
          mapped_alert_type: alertType,
          original_alert_type: originalAlertType,
          has_location: !!locationData && locationData.latitude !== 0,
          location_lat: alert.location_lat,
          location_long: alert.location_long,
        });
      }
      
      // Ensure priority is set correctly
      // If original_alert_type is 'emergency' or 'warning', ensure priority is 'high'
      let priority = alert.priority;
      if ((originalAlertType === 'emergency' || originalAlertType === 'warning') && !priority) {
        priority = 'high';
      } else if (!priority) {
        priority = alertType === 'emergency' ? 'high' : 'medium';
      }
      
      // Ensure required fields exist with defaults
      return {
        ...alert,
        alert_type: alertType as 'emergency' | 'normal' | 'security', // Explicitly set alert_type
        original_alert_type: originalAlertType, // Preserve original type if available
        priority: priority as 'high' | 'medium' | 'low',
        location: locationData,
        user_name: userName,
        user_email: alert.user_email || alert.user?.email || '',
        user_phone: alert.user_phone || alert.user?.phone || '',
        user_image: alert.user_image || alert.user?.image || '',
      };
    }));
    
    // Debug: Log summary of alert types
    const emergencyCount = transformedAlerts.filter(a => a.alert_type === 'emergency').length;
    const normalCount = transformedAlerts.filter(a => a.alert_type === 'normal').length;
    console.log('[AlertService] Fetched alerts summary:', {
      total: transformedAlerts.length,
      emergency: emergencyCount,
      normal: normalCount,
      alerts: transformedAlerts.map(a => ({
        id: a.id,
        alert_type: a.alert_type,
        status: a.status
      }))
    });
    
    return transformedAlerts;
  },

  acceptAlert: async (payload: AcceptAlertPayload) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', msg: 'Alert accepted (mock mode)' };
    }

    // Use documented SOS endpoint
    // PATCH /api/security/sos/{id}/ - Update SOS alert (accept it)
    const alertId = payload.log_id;
    
    if (!alertId) {
      throw new Error('Alert ID is required to accept alert');
    }

    const response = await axiosInstance.patch(
      API_ENDPOINTS.UPDATE_SOS.replace('{id}', String(alertId)),
      {
        status: 'accepted',
        security_id: payload.security_id,
        estimated_arrival: payload.estimated_arrival,
      }
    );
    return response.data;
  },

  closeAlert: async (logId: string, securityId: string, status: string) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', msg: 'Alert closed (mock mode)' };
    }

    // Use documented SOS endpoint
    // PATCH /api/security/sos/{id}/resolve/ - Resolve SOS alert
    const response = await axiosInstance.patch(
      API_ENDPOINTS.RESOLVE_SOS.replace('{id}', logId),
      {
      security_id: securityId,
        status: status || 'resolved',
      }
    );
    return response.data;
  },

  deleteAlert: async (alertId: string | number) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', msg: 'Alert deleted (mock mode)' };
    }

    // Use documented SOS endpoint
    // DELETE /api/security/sos/{id}/ - Delete SOS alert
    const response = await axiosInstance.delete(
      API_ENDPOINTS.DELETE_SOS.replace('{id}', String(alertId))
    );
    return response.data;
  },

  getAlertLogs: async (securityId: string, filter?: string, officerName?: string) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      const { getSampleLogs } = require('../../utils/sampleData');
      return { data: getSampleLogs() };
    }

    // Use documented SOS endpoints instead of legacy /logs/
    // For logs (history), use resolved SOS alerts
    // GET /api/security/sos/resolved/ - Get resolved alerts
    let endpoint = API_ENDPOINTS.GET_RESOLVED_SOS;
    
    // If filter is provided, adjust endpoint
    if (filter === 'active' || filter === 'pending') {
      endpoint = API_ENDPOINTS.GET_ACTIVE_SOS;
    } else if (filter === 'completed' || filter === 'resolved') {
      endpoint = API_ENDPOINTS.GET_RESOLVED_SOS;
    } else {
      // Default to all SOS alerts, then filter client-side
      endpoint = API_ENDPOINTS.LIST_SOS;
    }

    const response = await axiosInstance.get(endpoint);
    
    // Handle response format - ensure we always return { data: [...] }
    let logs: any[] = [];
    if (Array.isArray(response.data)) {
      logs = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      logs = response.data.data;
    } else if (response.data.results && Array.isArray(response.data.results)) {
      logs = response.data.results;
    }
    
    // Transform API response to match Alert interface structure
    // Backend might return location_lat/location_long instead of location object
    const transformedLogs = await Promise.all(logs.map(async (log: any) => {
      // Ensure location structure exists
      let locationData = log.location;
      if (!locationData && (log.location_lat || log.location_long)) {
        locationData = {
          latitude: parseFloat(log.location_lat || 0),
          longitude: parseFloat(log.location_long || 0),
          address: log.location_address || log.address || 'Location not available',
        };
      }
      if (!locationData) {
        locationData = {
          latitude: 0,
          longitude: 0,
          address: 'Location not available',
        };
      }
      
      // Extract officer's actual name (not username)
      let userName = (log as any).officer_name || 
                     log.user_name || 
                     log.user?.name || 
                     log.name || 
                     (log.user?.first_name && log.user?.last_name 
                       ? `${log.user.first_name} ${log.user.last_name}`.trim() 
                       : null) || 
                     (log.first_name && log.last_name 
                       ? `${log.first_name} ${log.last_name}`.trim() 
                       : null) || 
                     log.user?.first_name || 
                     log.first_name || 
                     log.username || 
                     log.user?.username;
      
      // If log was created by this security officer, use their name
      const isOfficerLog = log.security_id === securityId || 
                           log.created_by === securityId ||
                           (!userName);
      
      if (!userName && isOfficerLog && officerName) {
        userName = officerName;
      }
      if (!userName) {
        userName = 'Unknown User';
      }
      
      // Extract alert_type from various possible field names
      let alertType = log.alert_type || 
                     log.alertType || 
                     log.type || 
                     log.alert_type_id ||
                     'normal';
      
      // Preserve original_alert_type if backend returns it
      let originalAlertType = (log as any).original_alert_type || undefined;
      
      // If backend doesn't return original_alert_type, try to get it from local storage
      if (!originalAlertType) {
        try {
          const alertId = log.id || log.log_id;
          if (alertId) {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const alertTypeMapKey = `alert_type_map_${alertId}`;
            const storedType = await AsyncStorage.getItem(alertTypeMapKey);
            if (storedType && ['general', 'warning', 'emergency'].includes(storedType)) {
              originalAlertType = storedType as 'general' | 'warning' | 'emergency';
            }
          }
        } catch (storageError) {
          // Silently fail - local storage is optional
        }
      }
      
      // Normalize alert_type values
      if (typeof alertType === 'string') {
        alertType = alertType.toLowerCase();
        if (alertType === 'emergency' || alertType === 'urgent' || alertType === 'critical') {
          alertType = 'emergency';
          if (!originalAlertType) {
            originalAlertType = 'emergency';
          }
        } else if (alertType === 'normal' || alertType === 'general' || alertType === 'standard') {
          alertType = 'normal';
          if (!originalAlertType) {
            originalAlertType = 'general';
          }
        } else if (alertType === 'security' || alertType === 'security_alert') {
          alertType = 'security';
        }
      }
      
      // Ensure priority is set correctly
      // If original_alert_type is 'emergency' or 'warning', ensure priority is 'high'
      let priority = log.priority;
      if ((originalAlertType === 'emergency' || originalAlertType === 'warning') && !priority) {
        priority = 'high';
      } else if (!priority) {
        priority = alertType === 'emergency' ? 'high' : 'medium';
      }
      
      // Ensure required fields exist with defaults
      return {
        ...log,
        alert_type: alertType as 'emergency' | 'normal' | 'security',
        original_alert_type: originalAlertType,
        priority: priority as 'high' | 'medium' | 'low',
        location: locationData,
        user_name: userName,
        user_email: log.user_email || log.user?.email || '',
        user_phone: log.user_phone || log.user?.phone || '',
        user_image: log.user_image || log.user?.image || '',
      };
    }));
    
    return { data: transformedLogs };
  },
};














