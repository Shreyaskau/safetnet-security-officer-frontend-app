import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { BroadcastAlertPayload } from '../../types/alert.types';
import { ENABLE_API_CALLS } from '../config';

export const broadcastService = {
  sendBroadcast: async (payload: BroadcastAlertPayload) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
      return { result: 'success', msg: 'Broadcast sent (mock mode)' };
    }

    const response = await axiosInstance.post(
      API_ENDPOINTS.SEND_BROADCAST,
      payload
    );
    return response.data;
  },
};














