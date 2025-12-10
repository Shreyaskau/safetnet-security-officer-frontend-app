import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { Location } from '../../types/location.types';
import { ENABLE_API_CALLS } from '../config';

export const locationService = {
  updateLocation: async (
    securityId: string,
    location: Location,
    geofenceId: string
  ) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', msg: 'Location updated (mock mode)' };
    }

    const response = await axiosInstance.post(
      API_ENDPOINTS.UPDATE_LOCATION,
      {
        security_id: securityId,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        geofence_id: geofenceId,
      }
    );
    return response.data;
  },

  getUserLocation: async (userId: string) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return {
        result: 'success',
        data: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
      };
    }

    const response = await axiosInstance.post(
      API_ENDPOINTS.GET_USER_LOCATION,
      {
        security_id: userId,
        type: 'security',
      }
    );
    return response.data;
  },
};














