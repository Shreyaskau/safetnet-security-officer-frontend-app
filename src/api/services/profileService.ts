import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { SecurityOfficer } from '../../types/user.types';

export const profileService = {
  getProfile: async (securityId: string): Promise<SecurityOfficer> => {
    const response = await axiosInstance.post(API_ENDPOINTS.GET_PROFILE, {
      security_id: securityId,
    });
    return response.data;
  },

  updateProfile: async (securityId: string, updates: Partial<SecurityOfficer>) => {
    const response = await axiosInstance.post(API_ENDPOINTS.UPDATE_PROFILE, {
      security_id: securityId,
      ...updates,
    });
    return response.data;
  },
};














