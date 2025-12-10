import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { GeofenceArea } from '../../types/location.types';
import { getMockGeofence } from '../../utils/mockData';
import { ENABLE_API_CALLS } from '../config';

export const geofenceService = {
  getGeofenceDetails: async (geofenceId: string): Promise<GeofenceArea> => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return await getMockGeofence(geofenceId);
    }

    // Real API call
    const response = await axiosInstance.post(API_ENDPOINTS.GET_GEOFENCE_DETAILS, {
      geofence_id: geofenceId,
    });
    return response.data;
  },

  getUsersInArea: async (geofenceId: string) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      // Mock users in area
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        result: 'success',
        data: {
          users: [],
          count: 0,
        },
      };
    }

    const response = await axiosInstance.post(API_ENDPOINTS.GET_USERS_IN_AREA, {
      geofence_id: geofenceId,
    });
    return response.data;
  },
};














