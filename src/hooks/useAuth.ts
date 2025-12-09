import { useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from '../redux/slices/authSlice';
import { authService } from '../api/services/authService';
import { clearToken } from '../api/SecurityAPI';
import { LoginPayload } from '../types/user.types';
import { getMockOfficer } from '../utils/mockData';

// Enable mock mode - set to true to use mock data instead of backend
const USE_MOCK_DATA = false; // Change to false to use real backend

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginPayload) => {
    try {
      dispatch(loginStart());
      setIsLoading(true);

      const response = await authService.login(credentials);

      if (response.result === 'success' && response.role === 'security') {
        // Get full officer data (including stats) if using mock
        let officerData;
        if (USE_MOCK_DATA) {
          const mockOfficer = getMockOfficer(credentials.email);
          officerData = mockOfficer || {
            security_id: response.security_id!,
            name: response.name!,
            email_id: response.email_id!,
            mobile: response.mobile!,
            security_role: response.security_role! as any,
            geofence_id: response.geofence_id!,
            user_image: response.user_image,
            status: response.status! as any,
          };
        } else {
          officerData = {
            security_id: response.security_id!,
            name: response.name!,
            email_id: response.email_id!,
            mobile: response.mobile!,
            security_role: response.security_role! as any,
            geofence_id: response.geofence_id!,
            user_image: response.user_image,
            status: response.status! as any,
          };
        }

        dispatch(
          loginSuccess({
            token: USE_MOCK_DATA ? 'mock_token_' + Date.now() : 'token_here',
            officer: officerData,
          })
        );
        return { success: true };
      } else {
        dispatch(loginFailure(response.msg || 'Login failed'));
        return { success: false, message: response.msg };
      }
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (userId: string, role: string) => {
    try {
      await authService.logout(userId, role);
      // Clear token from SecurityAPI
      await clearToken();
      dispatch(logoutAction());
    } catch (error) {
      console.error('Logout error:', error);
      // Clear token even if logout API fails
      await clearToken();
      dispatch(logoutAction());
    }
  };

  return { login, logout, isLoading };
};












