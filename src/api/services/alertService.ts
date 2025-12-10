import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { Alert, AlertResponse, AcceptAlertPayload } from '../../types/alert.types';
import { getSampleAlerts } from '../../utils/sampleData';
import { ENABLE_API_CALLS } from '../config';

export const alertService = {
  getAlerts: async (securityId: string, geofenceId: string): Promise<Alert[]> => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return getSampleAlerts();
    }

    const response = await axiosInstance.post<AlertResponse>(
      API_ENDPOINTS.GET_SECURITY_ALERTS,
      {
        security_id: securityId,
        geofence_id: geofenceId,
      }
    );

    return response.data.data || [];
  },

  acceptAlert: async (payload: AcceptAlertPayload) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', msg: 'Alert accepted (mock mode)' };
    }

    const response = await axiosInstance.post(
      API_ENDPOINTS.ACCEPT_ALERT,
      payload
    );
    return response.data;
  },

  closeAlert: async (logId: string, securityId: string, status: string) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', msg: 'Alert closed (mock mode)' };
    }

    const response = await axiosInstance.post(API_ENDPOINTS.CLOSE_ALERT, {
      log_id: logId,
      security_id: securityId,
      status,
    });
    return response.data;
  },

  getAlertLogs: async (securityId: string, filter?: string) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      const { getSampleLogs } = require('../../utils/sampleData');
      return { data: getSampleLogs() };
    }

    const response = await axiosInstance.post(API_ENDPOINTS.GET_LOGS, {
      security_id: securityId,
      filter,
    });
    return response.data;
  },
};














