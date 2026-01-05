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
        security_id: securityId,
        name: 'Mock User',
        email_id: 'mock@example.com',
        mobile: '+1234567890',
        security_role: 'guard',
        geofence_id: '',
        status: 'active',
      } as SecurityOfficer;
    }

    try {
      console.log('[ProfileService] Fetching profile for security_id:', securityId);
      
      // Fetch profile from security officer endpoint
      const profileResponse = await axiosInstance.get(API_ENDPOINTS.GET_PROFILE);
      console.log('[ProfileService] Profile API Response:', JSON.stringify(profileResponse.data, null, 2));
      
      let profileData = profileResponse.data;
      
      // If profile doesn't have mobile/phone, try to fetch user profile data
      // The phone number might be in the User table, not the SecurityOfficer table
      const hasPhoneNumber = 
        (profileData.mobile && profileData.mobile) ||
        (profileData.phone && profileData.phone) ||
        (profileData.phone_number && profileData.phone_number) ||
        (profileData.user && profileData.user.mobile && profileData.user.mobile) ||
        (profileData.user && profileData.user.phone && profileData.user.phone);
      
      if (!hasPhoneNumber) {
        // Phone number not found - silently continue (backend work in progress)
        // Removed warning message as requested
      }
      
      return profileData;
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
      
      // Prepare update payload
      // If mobile/phone is being updated, we need to send it to the User table
      // Try sending it both at root level and in user object for backend compatibility
      const updatePayload: any = {
        security_id: securityId,
        ...updates,
      };
      
      // If mobile is in updates, also try sending it in user object
      // This helps if the backend expects it in the User table
      if (updates.mobile) {
        const phoneValue = updates.mobile || '';
        updatePayload.mobile = phoneValue;
        // Also send as 'phone' and 'phone_number' for backend compatibility
        updatePayload.phone = phoneValue;
        updatePayload.phone_number = phoneValue;
        // Also try nested user object (some backends expect this)
        updatePayload.user = {
          mobile: phoneValue,
          phone: phoneValue,
          phone_number: phoneValue,
        };
        console.log('[ProfileService] Phone number update - sending to both root and user object:', phoneValue);
      }
      
      // Try PATCH first (standard REST), fallback to POST if needed
      let response;
      try {
        // Use PATCH method for updating profile (standard REST)
        response = await axiosInstance.patch(API_ENDPOINTS.UPDATE_PROFILE, updatePayload);
      } catch (patchError: any) {
        // If PATCH fails with 405 (Method Not Allowed), try POST
        if (patchError.response?.status === 405) {
          console.log('[ProfileService] PATCH not allowed, trying POST...');
          response = await axiosInstance.post(API_ENDPOINTS.UPDATE_PROFILE, updatePayload);
        } else {
          throw patchError;
        }
      }
      
      console.log('[ProfileService] Profile update response:', JSON.stringify(response.data, null, 2));
      
      // Log phone number in response for debugging
      const responseData = response.data;
      const responseUser = responseData.user;
      console.log('[ProfileService] Phone number in update response:', {
        'responseData.mobile': responseData.mobile,
        'responseData.phone': responseData.phone,
        'responseData.phone_number': responseData.phone_number,
        'responseUser.mobile': responseUser && responseUser.mobile ? responseUser.mobile : undefined,
        'responseUser.phone': responseUser && responseUser.phone ? responseUser.phone : undefined,
      });
      
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














