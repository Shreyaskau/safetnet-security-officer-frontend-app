import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { Location } from '../../types/location.types';
import { ENABLE_API_CALLS } from '../config';

// Store active live location session ID per security officer
const activeSessions: Map<string, string> = new Map();

// Track ongoing session start requests to prevent race conditions
const pendingSessionStarts: Map<string, Promise<string | null>> = new Map();

export const locationService = {
  /**
   * Start a live location sharing session
   * POST /api/security/live_location/
   * @param securityId - Security officer ID
   * @param geofenceId - Geofence area ID
   * @param durationMinutes - Duration in minutes (default: 60 minutes = 1 hour)
   */
  startLiveLocation: async (
    securityId: string,
    geofenceId: string,
    durationMinutes: number = 60
  ) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', session_id: 'mock-session-id', msg: 'Live location started (mock mode)' };
    }

    // Check if a session start is already in progress for this officer
    const existingStart = pendingSessionStarts.get(securityId);
    if (existingStart) {
      console.log('[Location] Session start already in progress for:', securityId, '- waiting...');
      try {
        const sessionId = await existingStart;
        if (sessionId) {
          return { result: 'success', session_id: sessionId, msg: 'Live location started (reused)' };
        }
      } catch (error) {
        // If existing start failed, continue to create new one
        pendingSessionStarts.delete(securityId);
      }
    }

    // Create a promise for this session start
    const startPromise = (async (): Promise<string | null> => {
      try {
        const response = await axiosInstance.post(
          API_ENDPOINTS.START_LIVE_LOCATION,
          {
            security_id: securityId,
            geofence_id: geofenceId,
            duration_minutes: durationMinutes,
          }
        );
        
        // Extract session ID from response
        const sessionId = 
          response.data?.session?.id ||
          response.data?.session?.session_id ||
          response.data?.session_id ||
          response.data?.id ||
          response.data?.data?.session_id ||
          response.data?.data?.id ||
          null;
        
        console.log('[Location] Start live location response:', JSON.stringify(response.data, null, 2));
        console.log('[Location] Extracted session ID:', sessionId);
        
        if (sessionId) {
          const sessionIdStr = String(sessionId);
          const oldSessionId = activeSessions.get(securityId);
          if (oldSessionId && oldSessionId !== sessionIdStr) {
            console.log('[Location] Replacing old session ID:', oldSessionId, 'with new:', sessionIdStr);
          }
          activeSessions.set(securityId, sessionIdStr);
          console.log('[Location] Stored session ID:', sessionIdStr, 'for security officer:', securityId);
          pendingSessionStarts.delete(securityId);
          return sessionIdStr;
        }
        
        if (response.status >= 200 && response.status < 300) {
          console.warn('[Location] Session ID not found in response');
          const tempSessionId = `temp_${securityId}_${Date.now()}`;
          activeSessions.set(securityId, tempSessionId);
          pendingSessionStarts.delete(securityId);
          return tempSessionId;
        }
        
        pendingSessionStarts.delete(securityId);
        return null;
      } catch (error: any) {
        if (error?.response?.status === 400) {
          console.error('[Location] Validation error starting live location:', error?.response?.data || error?.message);
        } else if (error?.response?.status !== 404) {
          console.warn('[Location] Error starting live location:', error?.message || error);
        }
        pendingSessionStarts.delete(securityId);
        throw error;
      }
    })();
    
    // Store the promise so other calls can wait for it
    pendingSessionStarts.set(securityId, startPromise);
    
    try {
      const sessionId = await startPromise;
      if (sessionId) {
        return { result: 'success', session_id: sessionId, data: null };
      }
      throw new Error('Session start failed - no session ID returned');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active live location sessions
   * GET /api/security/live_location/
   */
  getActiveSessions: async () => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', data: [], msg: 'Active sessions (mock mode)' };
    }

    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_LIVE_LOCATION_SESSIONS);
      
      // Handle different response formats
      const sessions = response.data?.data || response.data?.results || response.data || [];
      return { result: 'success', data: sessions };
    } catch (error: any) {
      // Only log non-404 errors
      if (error?.response?.status !== 404) {
        console.warn('[Location] Error getting active sessions:', error?.message || error);
      }
      return { result: 'error', data: [] };
    }
  },

  /**
   * Update location for an active session
   * PATCH /api/security/live_location/{session_id}/
   * This will automatically start a session if one doesn't exist
   */
  updateLocation: async (
    securityId: string,
    location: Location,
    geofenceId: string
  ) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return { result: 'success', msg: 'Location updated (mock mode)' };
    }

    try {
      // Get current session ID
      let sessionId = activeSessions.get(securityId);
      
      // If no active session, start one
      if (!sessionId) {
        try {
          console.log('[Location] No active session found, starting new session for:', securityId);
          const startResult = await locationService.startLiveLocation(securityId, geofenceId);
          sessionId = startResult.session_id;
          console.log('[Location] New session started:', sessionId);
        } catch (error: any) {
          // If starting session fails, return error
          if (error?.response?.status !== 404) {
            console.warn('[Location] Could not start live location session:', error?.message || error);
          }
          return { result: 'error', msg: 'Could not start live location session' };
        }
      }

      // Update location using the session
      if (sessionId) {
        const updateUrl = API_ENDPOINTS.UPDATE_LIVE_LOCATION.replace('{session_id}', sessionId);
        console.log('[Location] Updating location for session:', sessionId);
        
        try {
          const response = await axiosInstance.patch(updateUrl, {
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            // Optionally include other fields
            accuracy: location.accuracy?.toString(),
            timestamp: location.timestamp?.toString(),
          });
          return { result: 'success', data: response.data };
        } catch (updateError: any) {
          // If session has ended (400), clear it and start a new one
          if (updateError?.response?.status === 400 && 
              (updateError?.response?.data?.error?.includes('ended') || 
               updateError?.response?.data?.error?.includes('expired'))) {
            console.warn('[Location] Session expired/ended:', sessionId, '- Starting new session');
            activeSessions.delete(securityId);
            
            // Try to start a new session and update immediately
            try {
              const startResult = await locationService.startLiveLocation(securityId, geofenceId);
              const newSessionId = startResult.session_id;
              const newUpdateUrl = API_ENDPOINTS.UPDATE_LIVE_LOCATION.replace('{session_id}', newSessionId);
              
              const retryResponse = await axiosInstance.patch(newUpdateUrl, {
                latitude: location.latitude.toString(),
                longitude: location.longitude.toString(),
                accuracy: location.accuracy?.toString(),
                timestamp: location.timestamp?.toString(),
              });
              console.log('[Location] Successfully updated location with new session:', newSessionId);
              return { result: 'success', data: retryResponse.data };
            } catch (retryError: any) {
              console.error('[Location] Failed to start new session after expiration:', retryError?.message || retryError);
              return { result: 'error', msg: 'Session expired and could not restart' };
            }
          }
          throw updateError; // Re-throw if not a session expiration error
        }
      }

      return { result: 'error', msg: 'No active session' };
    } catch (error: any) {
      // If 404, clear session and try to restart on next update
      if (error?.response?.status === 404) {
        activeSessions.delete(securityId);
      } else {
        // Only log non-404 errors
        console.warn('[Location] Error updating location:', error?.message || error);
      }
      return { result: 'error', msg: 'Location update failed' };
    }
  },

  /**
   * Stop live location sharing
   * DELETE /api/security/live_location/{session_id}/
   */
  stopLiveLocation: async (securityId: string) => {
    const sessionId = activeSessions.get(securityId);
    
    if (!sessionId) {
      return { result: 'success', msg: 'No active session to stop' };
    }

    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      activeSessions.delete(securityId);
      return { result: 'success', msg: 'Live location stopped (mock mode)' };
    }

    try {
      const stopUrl = API_ENDPOINTS.STOP_LIVE_LOCATION.replace('{session_id}', sessionId);
      await axiosInstance.delete(stopUrl);
      
      // Remove session from map
      activeSessions.delete(securityId);
      
      return { result: 'success', msg: 'Live location stopped' };
    } catch (error: any) {
      // Even if API call fails, remove session locally
      activeSessions.delete(securityId);
      
      // Only log non-404 errors
      if (error?.response?.status !== 404) {
        console.warn('[Location] Error stopping live location:', error?.message || error);
      }
      return { result: 'error', msg: 'Error stopping live location' };
    }
  },

  /**
   * Get user location from active sessions
   * GET /api/security/live_location/ - then find user's session
   * Note: User location is typically included in SOS alert data
   */
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

    try {
      // Get all active sessions
      const sessionsResult = await locationService.getActiveSessions();
      const sessions = sessionsResult.data || [];
      
      // Find the session for this user
      const userSession = Array.isArray(sessions) 
        ? sessions.find((s: any) => 
            s.user_id === userId || 
            s.security_id === userId ||
            s.security_officer_id === userId
          )
        : null;
      
      if (userSession && (userSession.latitude !== undefined && userSession.longitude !== undefined)) {
        return {
          result: 'success',
          latitude: parseFloat(userSession.latitude),
          longitude: parseFloat(userSession.longitude),
          data: userSession,
        };
      }
      
      // If no session found, return error (location should come from alert)
      throw new Error('User location not found in active live location sessions');
    } catch (error: any) {
      // Only log non-404 errors
      if (error?.response?.status !== 404 && error?.message !== 'User location not found in active live location sessions') {
        console.warn('[Location] Error getting user location:', error?.message || error);
      }
      throw error; // Re-throw so caller knows it failed
    }
  },
};














