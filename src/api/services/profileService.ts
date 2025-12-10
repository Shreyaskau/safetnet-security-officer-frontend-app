import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { SecurityOfficer } from '../../types/user.types';
import { ENABLE_API_CALLS } from '../config';

export const profileService = {
  getProfile: async (securityId: string): Promise<SecurityOfficer> => {
    // Skip API call if disabled - return mock profile
    if (!ENABLE_API_CALLS) {
      // Return a basic mock profile structure
      return {
        id: securityId,
        username: 'mock_user',
        email: 'mock@example.com',
        role: 'security_officer',
        first_name: 'Mock',
        last_name: 'User',
      } as SecurityOfficer;
    }

    const response = await axiosInstance.post(API_ENDPOINTS.GET_PROFILE, {
      security_id: securityId,
    });
    return response.data;
  },

  updateProfile: async (securityId: string, updates: Partial<SecurityOfficer>) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', msg: 'Profile updated (mock mode)' };
    }

    const response = await axiosInstance.post(API_ENDPOINTS.UPDATE_PROFILE, {
      security_id: securityId,
      ...updates,
    });
    return response.data;
  },
};














