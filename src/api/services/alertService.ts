import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { Alert, AlertResponse, AcceptAlertPayload } from '../../types/alert.types';

export const alertService = {
  getAlerts: async (securityId: string, geofenceId: string): Promise<Alert[]> => {
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
    const response = await axiosInstance.post(
      API_ENDPOINTS.ACCEPT_ALERT,
      payload
    );
    return response.data;
  },

  closeAlert: async (logId: string, securityId: string, status: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.CLOSE_ALERT, {
      log_id: logId,
      security_id: securityId,
      status,
    });
    return response.data;
  },

  getAlertLogs: async (securityId: string, filter?: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.GET_LOGS, {
      security_id: securityId,
      filter,
    });
    return response.data;
  },
};














