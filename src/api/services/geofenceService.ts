import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { GeofenceArea } from '../../types/location.types';
import { getMockGeofence } from '../../utils/mockData';

// Enable mock mode - set to true to use mock data instead of backend
const USE_MOCK_DATA = false; // Change to false to use real backend

export const geofenceService = {
  getGeofenceDetails: async (geofenceId: string): Promise<GeofenceArea> => {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      return await getMockGeofence(geofenceId);
    }

    // Real API call
    const response = await axiosInstance.post(API_ENDPOINTS.GET_GEOFENCE_DETAILS, {
      geofence_id: geofenceId,
    });
    return response.data;
  },

  getUsersInArea: async (geofenceId: string) => {
    if (USE_MOCK_DATA) {
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














