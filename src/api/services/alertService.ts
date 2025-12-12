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
    const response = await axiosInstance.get<AlertResponse>(
      API_ENDPOINTS.LIST_SOS
    );

    // Handle response format - could be array or { data: [] }
    let alerts: any[] = [];
    if (Array.isArray(response.data)) {
      alerts = response.data;
    } else {
      alerts = response.data.data || response.data.results || [];
    }

    // Transform API response to match Alert interface structure
    // Backend might return location_lat/location_long instead of location object
    return alerts.map((alert: any) => {
      // Ensure ID fields exist - SOS API might use 'id' instead of 'log_id'
      if (!alert.log_id && alert.id) {
        alert.log_id = alert.id;
      }
      if (!alert.id && alert.log_id) {
        alert.id = alert.log_id;
      }
      
      // Ensure location structure exists
      if (!alert.location && (alert.location_lat || alert.location_long)) {
        alert.location = {
          latitude: parseFloat(alert.location_lat || 0),
          longitude: parseFloat(alert.location_long || 0),
          address: alert.location_address || alert.address || 'Location not available',
        };
      }
      
      // If alert was created by this security officer, use their name
      // Check if security_id matches or if user_name is missing
      const isOfficerAlert = alert.security_id === securityId || 
                             alert.created_by === securityId ||
                             (!alert.user_name && !alert.user?.name && !alert.username);
      
      // Determine user name - prefer API response, fallback to officer name if it's their alert
      let userName = alert.user_name || alert.user?.name || alert.username;
      if (!userName && isOfficerAlert && officerName) {
        userName = officerName; // Use logged-in officer's name
      }
      if (!userName) {
        userName = 'Unknown User'; // Final fallback
      }
      
      // Ensure required fields exist with defaults
      return {
        ...alert,
        location: alert.location || {
          latitude: 0,
          longitude: 0,
          address: 'Location not available',
        },
        user_name: userName,
        user_email: alert.user_email || alert.user?.email || '',
        user_phone: alert.user_phone || alert.user?.phone || '',
        user_image: alert.user_image || alert.user?.image || '',
      };
    });
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
    const transformedLogs = logs.map((log: any) => {
      // Ensure location structure exists
      if (!log.location && (log.location_lat || log.location_long)) {
        log.location = {
          latitude: parseFloat(log.location_lat || 0),
          longitude: parseFloat(log.location_long || 0),
          address: log.location_address || log.address || 'Location not available',
        };
      }
      
      // If log was created by this security officer, use their name
      const isOfficerLog = log.security_id === securityId || 
                           log.created_by === securityId ||
                           (!log.user_name && !log.user?.name && !log.username);
      
      // Determine user name - prefer API response, fallback to officer name if it's their log
      let userName = log.user_name || log.user?.name || log.username;
      if (!userName && isOfficerLog && officerName) {
        userName = officerName; // Use logged-in officer's name
      }
      if (!userName) {
        userName = 'Unknown User'; // Final fallback
      }
      
      // Ensure required fields exist with defaults
      return {
        ...log,
        location: log.location || {
          latitude: 0,
          longitude: 0,
          address: 'Location not available',
        },
        user_name: userName,
        user_email: log.user_email || log.user?.email || '',
        user_phone: log.user_phone || log.user?.phone || '',
        user_image: log.user_image || log.user?.image || '',
      };
    });
    
    return { data: transformedLogs };
  },
};














