import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { Location } from '../../types/location.types';

export const locationService = {
  updateLocation: async (
    securityId: string,
    location: Location,
    geofenceId: string
  ) => {
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














