import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { LoginPayload, LoginResponse, DjangoLoginResponse } from '../../types/user.types';
import { storage } from '../../utils/storage';
import { constants } from '../../utils/constants';
import { mockLogin } from '../../utils/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ENABLE_API_CALLS } from '../config';

// Use global API enable flag
const USE_MOCK_DATA = !ENABLE_API_CALLS;

export const authService = {
  login: async (credentials: LoginPayload): Promise<LoginResponse> => {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      const mockResponse = await mockLogin(credentials.email, credentials.password);
      
      if (mockResponse.result === 'success') {
        // Store token
        await storage.setAuthToken('mock_bearer_token_' + Date.now());
        if (mockResponse.security_id) {
          await storage.setUserId(mockResponse.security_id);
        }
        await storage.setItem(constants.STORAGE_KEYS.ROLE, mockResponse.role);
      }
      
      return mockResponse;
    }

    // Django REST API call
    // Send username and password (Django expects username field, not email)
    const response = await axiosInstance.post<DjangoLoginResponse>(
      API_ENDPOINTS.LOGIN,
      {
        username: credentials.email, // Use email as username (Django accepts both)
        password: credentials.password,
      }
    );

    // Django returns: { access, refresh, user: { id, username, email, role, ... } }
    const djangoResponse = response.data;

    if (djangoResponse.access && djangoResponse.user) {
      // Store access token (JWT)
      await AsyncStorage.setItem('token', djangoResponse.access);
      await AsyncStorage.setItem('refresh_token', djangoResponse.refresh);
      await storage.setAuthToken(djangoResponse.access);
      
      // Store user ID
      if (djangoResponse.user.id) {
        await storage.setUserId(djangoResponse.user.id.toString());
      }
      
      // Store role
      if (djangoResponse.user.role) {
        await storage.setItem(constants.STORAGE_KEYS.ROLE, djangoResponse.user.role);
      }

      // Log full login response for debugging
      console.log('[AuthService] Login response:', JSON.stringify(djangoResponse, null, 2));
      console.log('[AuthService] Geofence ID from login:', djangoResponse.user?.geofence_id);

      // Convert Django response to legacy format for compatibility
      const legacyResponse: LoginResponse = {
        result: 'success',
        role: djangoResponse.user.role === 'security_officer' ? 'security' : 'user',
        security_id: djangoResponse.user.id.toString(),
        name: djangoResponse.user.first_name || djangoResponse.user.username,
        email_id: djangoResponse.user.email || djangoResponse.user.username,
        mobile: djangoResponse.user.mobile || '',
        security_role: djangoResponse.user.role || 'security_officer',
        // Handle geofence_id from different possible locations in response
        geofence_id: djangoResponse.user.geofence_id?.toString() || 
                     djangoResponse.geofence_id?.toString() || 
                     djangoResponse.user.security_officer?.geofence_id?.toString() || 
                     '',
        user_image: djangoResponse.user.user_image || '',
        status: djangoResponse.user.status || 'active',
        // Include Django format fields
        access: djangoResponse.access,
        refresh: djangoResponse.refresh,
        user: djangoResponse.user,
      };

      console.log('[AuthService] Mapped geofence_id:', legacyResponse.geofence_id);

      return legacyResponse;
    }

    // If response doesn't match expected format, return error
    return {
      result: 'failed',
      role: 'user',
      msg: 'Invalid response from server',
    };
  },

  logout: async (userId: string, role: string) => {
    if (USE_MOCK_DATA) {
      // Mock logout - just clear storage
      await storage.clear();
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refresh_token');
      return { result: 'success', msg: 'Logged out successfully' };
    }

    try {
      // Django REST API logout
      await axiosInstance.post(API_ENDPOINTS.LOGOUT, {
        // Django might not require body, but we send it for compatibility
      });
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.log('Logout API call failed, clearing local storage anyway');
    }

    // Clear all storage
    await storage.clear();
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refresh_token');
    
    return { result: 'success', msg: 'Logged out successfully' };
  },

  forgotPassword: async (email: string) => {
    if (USE_MOCK_DATA) {
      // Mock forgot password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        result: 'success',
        msg: 'Password reset link sent to your email (mock)',
      };
    }

    // Django REST API forgot password
    const response = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD, {
      email,
    });
    
    // Django might return different format, convert to legacy format
    if (response.data) {
      return {
        result: 'success',
        msg: response.data.message || response.data.detail || 'Password reset link sent to your email',
      };
    }
    
    return {
      result: 'success',
      msg: 'Password reset link sent to your email',
    };
  },

  // Refresh JWT token
  refreshToken: async (refreshToken: string): Promise<string | null> => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.REFRESH_TOKEN, {
        refresh: refreshToken,
      });
      
      if (response.data.access) {
        // Store new access token
        await AsyncStorage.setItem('token', response.data.access);
        await storage.setAuthToken(response.data.access);
        return response.data.access;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  },
};














