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

    try {
      console.log('[ProfileService] Fetching profile for security_id:', securityId);
      // Use GET for profile endpoint (standard REST)
      const response = await axiosInstance.get(API_ENDPOINTS.GET_PROFILE);
      console.log('[ProfileService] Profile API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('[ProfileService] Error fetching profile:', error);
      if (error?.response) {
        console.error('[ProfileService] Error response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  updateProfile: async (securityId: string, updates: Partial<SecurityOfficer>) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', msg: 'Profile updated (mock mode)' };
    }

    try {
      console.log('[ProfileService] Updating profile for security_id:', securityId);
      console.log('[ProfileService] Update payload:', JSON.stringify(updates, null, 2));
      
      // Try PATCH first (standard REST), fallback to POST if needed
      let response;
      try {
        // Use PATCH method for updating profile (standard REST)
        response = await axiosInstance.patch(API_ENDPOINTS.UPDATE_PROFILE, {
          security_id: securityId,
          ...updates,
        });
      } catch (patchError: any) {
        // If PATCH fails with 405 (Method Not Allowed), try POST
        if (patchError.response?.status === 405) {
          console.log('[ProfileService] PATCH not allowed, trying POST...');
          response = await axiosInstance.post(API_ENDPOINTS.UPDATE_PROFILE, {
            security_id: securityId,
            ...updates,
          });
        } else {
          throw patchError;
        }
      }
      
      console.log('[ProfileService] Profile update response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('[ProfileService] Error updating profile:', error);
      if (error?.response) {
        console.error('[ProfileService] Error response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },
};














