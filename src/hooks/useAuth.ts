import { useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  updateOfficerProfile,
} from '../redux/slices/authSlice';
import { authService } from '../api/services/authService';
import { profileService } from '../api/services/profileService';
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
          // Use response data directly - it already has geofence_id from login
          officerData = {
            security_id: response.security_id!,
            name: response.name!,
            email_id: response.email_id!,
            mobile: response.mobile!,
            security_role: response.security_role! as any,
            geofence_id: response.geofence_id || '', // Ensure it's set even if empty
            user_image: response.user_image,
            status: response.status! as any,
          };
          
          // Log the officer data being stored
          console.log('[useAuth] Storing officer data:', {
            name: officerData.name,
            security_id: officerData.security_id,
            geofence_id: officerData.geofence_id,
            hasGeofenceId: !!officerData.geofence_id
          });
        }

        dispatch(
          loginSuccess({
            token: USE_MOCK_DATA ? 'mock_token_' + Date.now() : 'token_here',
            officer: officerData,
          })
        );
        
        // If geofence_id is missing, try to fetch profile to get it
        if (!USE_MOCK_DATA && (!officerData.geofence_id || officerData.geofence_id === '')) {
          console.log('[useAuth] geofence_id missing, fetching profile to get geofence_id...');
          try {
            const profile = await profileService.getProfile(officerData.security_id);
            console.log('[useAuth] Profile response:', JSON.stringify(profile, null, 2));
            
            // Extract geofence_id from profile - handle multiple formats
            // Check for ID fields first
            let profileGeofenceId = (profile as any)?.geofence_id || 
                                   (profile as any)?.assigned_geofence?.id?.toString() ||
                                   (profile as any)?.assigned_geofence_id?.toString() ||
                                   (profile as any)?.officer_id?.toString() ||  // Sometimes officer_id is geofence_id
                                   '';
            
            // If no ID found, check for geofence name and map to ID
            if (!profileGeofenceId || profileGeofenceId === '') {
              const geofenceName = (profile as any)?.officer_geofence || 
                                 (profile as any)?.geofence_name || 
                                 (profile as any)?.assigned_geofence?.name ||
                                 '';
              
              if (geofenceName) {
                console.log('[useAuth] Found geofence name in profile:', geofenceName);
                // Map known geofence names to IDs (based on user's earlier info)
                // "Pune PCMC Area" = ID "4"
                const geofenceNameToIdMap: Record<string, string> = {
                  'Pune PCMC Area': '4',
                  'Pune PCMC': '4',
                };
                
                profileGeofenceId = geofenceNameToIdMap[geofenceName] || '';
                
                if (profileGeofenceId) {
                  console.log('[useAuth] Mapped geofence name to ID:', geofenceName, '->', profileGeofenceId);
                } else {
                  console.warn('[useAuth] Geofence name found but not in mapping:', geofenceName);
                }
              }
            }
            
            if (profileGeofenceId && profileGeofenceId !== '') {
              console.log('[useAuth] Found geofence_id in profile:', profileGeofenceId);
              dispatch(updateOfficerProfile({ geofence_id: profileGeofenceId }));
            } else {
              console.warn('[useAuth] Profile fetched but geofence_id still not found. Profile data:', JSON.stringify(profile, null, 2));
            }
          } catch (error) {
            console.warn('[useAuth] Failed to fetch profile for geofence_id:', error);
          }
        }
        
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












