import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { BroadcastAlertPayload } from '../../types/alert.types';

export const broadcastService = {
  sendBroadcast: async (payload: BroadcastAlertPayload) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.SEND_BROADCAST,
      payload
    );
    return response.data;
  },
};














