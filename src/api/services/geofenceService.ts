import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { GeofenceArea } from '../../types/location.types';
import { getMockGeofence } from '../../utils/mockData';
import { ENABLE_API_CALLS } from '../config';

export const geofenceService = {
  getGeofenceDetails: async (geofenceId: string | number): Promise<GeofenceArea> => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      return await getMockGeofence(String(geofenceId));
    }

    try {
      // The backend doesn't have a dedicated /api/security/geofence/ endpoint
      // Geofence data is included in the profile endpoint response as assigned_geofence
      console.log('[Geofence] Fetching geofence details for ID:', geofenceId);
      console.log('[Geofence] Using profile endpoint to get assigned_geofence data');
      
      // Since backend doesn't have /api/security/geofence/ endpoint,
      // and profile doesn't have assigned_geofence, we need to use geofence_id
      // to construct a direct geofence API call or use alternative approach
      
      // First, try to get geofence using geofence_id with RESTful pattern
      // GET /api/security/geofence/{id}/ might work if backend has it
      console.log('[Geofence] Attempting to fetch geofence with ID:', geofenceId);
      
      let response;
      const geofenceIdStr = String(geofenceId);
      
      // Try different possible geofence endpoint patterns
      // Note: Geofence API is separate from live_location API
      const possibleEndpoints: Array<{ url: string; method: 'GET' | 'POST'; data?: any }> = [
        // Pattern 1: GET with ID in path (RESTful) - Most common Django pattern
        { url: `/api/security/geofence/${geofenceIdStr}/`, method: 'GET' },
        
        // Pattern 2: Alternative paths (maybe geofence is at root level)
        { url: `/api/geofence/${geofenceIdStr}/`, method: 'GET' },
        { url: `/api/geofence/${geofenceIdStr}`, method: 'GET' },
        
        // Pattern 3: GET with query parameters
        { url: `/api/security/geofence/?id=${geofenceIdStr}`, method: 'GET' },
        { url: `/api/security/geofence/?geofence_id=${geofenceIdStr}`, method: 'GET' },
        { url: `/api/geofence/?id=${geofenceIdStr}`, method: 'GET' },
        { url: `/api/geofence/?geofence_id=${geofenceIdStr}`, method: 'GET' },
        
        // Pattern 4: POST with body
        { url: `/api/security/geofence/`, method: 'POST', data: { geofence_id: geofenceIdStr } },
        { url: `/api/security/geofence/`, method: 'POST', data: { id: geofenceIdStr } },
        { url: `/api/geofence/`, method: 'POST', data: { geofence_id: geofenceIdStr } },
        
        // Pattern 5: GET without ID (uses JWT token to get current user's geofence)
        { url: `/api/security/geofence/`, method: 'GET' },
        { url: `/api/user/geofence/`, method: 'GET' },
        { url: `/api/geofence/`, method: 'GET' },
      ];
      
      let lastError: any = null;
      let successfulEndpoint: string | null = null;
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`[Geofence] Trying: ${endpoint.method} ${endpoint.url}`);
          if (endpoint.data) {
            console.log(`[Geofence] Request body:`, endpoint.data);
          }
          
          if (endpoint.method === 'POST' && endpoint.data) {
            response = await axiosInstance.post(endpoint.url, endpoint.data);
          } else {
            response = await axiosInstance.get(endpoint.url);
          }
          
          successfulEndpoint = `${endpoint.method} ${endpoint.url}`;
          console.log(`[Geofence] ✅ Success with ${successfulEndpoint}`);
          console.log(`[Geofence] Response status:`, response.status);
          break;
        } catch (error: any) {
          lastError = error;
          const status = error?.response?.status;
          if (status !== 404) {
            // If it's not 404, it might be a different error (401, 500, etc.)
            // which means the endpoint exists but there's an issue
            console.warn(`[Geofence] ${endpoint.method} ${endpoint.url} returned:`, status);
            if (status === 401) {
              console.warn(`[Geofence] Authentication error - check JWT token`);
            } else if (status === 403) {
              console.warn(`[Geofence] Authorization error - user may not have access to this geofence`);
            } else if (status >= 500) {
              console.warn(`[Geofence] Server error - backend issue`);
            }
          }
          continue;
        }
      }
      
      // If all endpoints failed, try to get geofence data from profile as last resort
      if (!response) {
        console.warn('[Geofence] ❌ All geofence endpoint patterns failed');
        console.warn('[Geofence] Tried endpoints:', possibleEndpoints.map(e => `${e.method} ${e.url}`).join(', '));
        console.warn('[Geofence] Last error status:', lastError?.response?.status);
        console.log('[Geofence] Attempting fallback: Fetching profile to check for geofence data...');
        
        try {
          // Try fetching profile to see if it contains geofence information
          const profileResponse = await axiosInstance.get(API_ENDPOINTS.GET_PROFILE);
          console.log('[Geofence] Profile response structure:', JSON.stringify(profileResponse.data, null, 2));
          
          const profileData: any = profileResponse.data;
          console.log('[Geofence] Profile data structure:', JSON.stringify(profileData, null, 2));
          
          // Check if profile has geofence-related data in any format
          if (profileData?.assigned_geofence || profileData?.geofence) {
            console.log('[Geofence] ✅ Found geofence data in profile response!');
            response = { data: profileData };
          } else if (profileData?.geofence_id) {
            // Profile has geofence_id but not full geofence data
            console.warn('[Geofence] Profile has geofence_id:', profileData.geofence_id, 'but no geofence details');
            console.warn('[Geofence] Profile contains:', Object.keys(profileData).join(', '));
            
            // Try one more time with the geofence_id from profile
            const profileGeofenceId = profileData.geofence_id;
            console.log('[Geofence] Retrying with profile geofence_id:', profileGeofenceId);
            
            try {
              const retryResponse = await axiosInstance.get(`/api/security/geofence/${profileGeofenceId}/`);
              response = retryResponse;
              console.log('[Geofence] ✅ Success with profile geofence_id retry!');
            } catch (retryError: any) {
              console.error('[Geofence] Retry also failed:', retryError?.response?.status);
              throw new Error(`Geofence API endpoint not found. Profile has geofence_id: ${profileGeofenceId}, but GET /api/security/geofence/${profileGeofenceId}/ returns 404. Please check your backend URL routing.`);
            }
          } else if (profileData?.officer_geofence) {
            // Profile has geofence name but not ID or details - create fallback geofence
            console.warn('[Geofence] Profile has geofence name:', profileData.officer_geofence, 'but no geofence_id or details');
            console.log('[Geofence] Creating fallback geofence from profile data');
            
            // Create a basic geofence using geofence name and default Pune coordinates
            // Use current location if available, otherwise use default Pune center
            const defaultCenter = { latitude: 18.5204, longitude: 73.8567 }; // Pune center
            const defaultRadius = 5000; // 5km radius
            
            // Create a square polygon around the center
            const radiusDegrees = defaultRadius / 111000; // Rough conversion: 1 degree ≈ 111km
            const fallbackCoordinates = [
              { latitude: defaultCenter.latitude - radiusDegrees, longitude: defaultCenter.longitude - radiusDegrees },
              { latitude: defaultCenter.latitude - radiusDegrees, longitude: defaultCenter.longitude + radiusDegrees },
              { latitude: defaultCenter.latitude + radiusDegrees, longitude: defaultCenter.longitude + radiusDegrees },
              { latitude: defaultCenter.latitude + radiusDegrees, longitude: defaultCenter.longitude - radiusDegrees },
            ];
            
            const fallbackGeofence: GeofenceArea = {
              geofence_id: String(geofenceId),
              name: profileData.officer_geofence || 'Unnamed Geofence',
              description: `Geofence area for ${profileData.officer_geofence}`,
              coordinates: fallbackCoordinates,
              center: defaultCenter,
              radius: defaultRadius,
              active_users_count: 0,
              area_size: 0,
            };
            
            console.log('[Geofence] ✅ Created fallback geofence:', fallbackGeofence);
            return fallbackGeofence;
          } else {
            console.error('[Geofence] Profile does not contain geofence information');
            console.error('[Geofence] Available profile fields:', Object.keys(profileData).join(', '));
            throw new Error(`Geofence API endpoint not found and profile has no geofence data. Please implement GET /api/security/geofence/{id}/ endpoint in your backend.`);
          }
        } catch (profileError: any) {
          console.error('[Geofence] Profile fallback also failed:', profileError);
          throw new Error(`Geofence API endpoint not found. Tried: ${possibleEndpoints.map(e => `${e.method} ${e.url}`).join(', ')}. Profile endpoint also unavailable or doesn't contain geofence data. Please implement GET /api/security/geofence/{id}/ in your backend.`);
        }
      }
      
      console.log('[Geofence] API Response from', successfulEndpoint, ':', JSON.stringify(response.data, null, 2));
      
      // Handle different response formats from backend
      let geofenceData = response.data;
      
      // If response is wrapped in data property
      if (response.data?.data) {
        geofenceData = response.data.data;
      }
      
      // Handle assigned_geofence structure (if it exists)
      let assignedGeofence = null;
      if (geofenceData.assigned_geofence) {
        assignedGeofence = geofenceData.assigned_geofence;
      } else if (geofenceData.geofence) {
        assignedGeofence = geofenceData.geofence;
      } else {
        // If no nested structure, use the data directly
        assignedGeofence = geofenceData;
      }
      
      // Parse polygon_json if it exists (could be string or array)
      let coordinates: Array<{ latitude: number; longitude: number }> = [];
      if (assignedGeofence?.polygon_json) {
        try {
          // If polygon_json is a string, parse it
          const polygonData = typeof assignedGeofence.polygon_json === 'string'
            ? JSON.parse(assignedGeofence.polygon_json)
            : assignedGeofence.polygon_json;
          
          // Handle different polygon formats
          if (Array.isArray(polygonData)) {
            coordinates = polygonData.map((coord: any) => {
              // Handle [lat, lng] format
              if (Array.isArray(coord)) {
                return { latitude: coord[0], longitude: coord[1] };
              }
              // Handle {lat, lng} or {latitude, longitude} format
              return {
                latitude: coord.latitude || coord.lat || 0,
                longitude: coord.longitude || coord.lng || 0,
              };
            });
          }
          console.log('[Geofence] Parsed polygon_json:', coordinates);
        } catch (error) {
          console.error('[Geofence] Error parsing polygon_json:', error);
        }
      }
      
      // Extract center point
      let center = { latitude: 0, longitude: 0 };
      if (assignedGeofence?.center_point) {
        try {
          const centerData = typeof assignedGeofence.center_point === 'string'
            ? JSON.parse(assignedGeofence.center_point)
            : assignedGeofence.center_point;
          
          if (Array.isArray(centerData)) {
            center = { latitude: centerData[0], longitude: centerData[1] };
          } else {
            center = {
              latitude: centerData.latitude || centerData.lat || 0,
              longitude: centerData.longitude || centerData.lng || 0,
            };
          }
          console.log('[Geofence] Parsed center_point:', center);
        } catch (error) {
          console.error('[Geofence] Error parsing center_point:', error);
        }
      }
      
      // Ensure geofence_id is set from assigned_geofence or parameter
      const responseGeofenceId = assignedGeofence?.id || 
                                  assignedGeofence?.geofence_id || 
                                  geofenceData?.geofence_id ||
                                  geofenceData?.id ||
                                  String(geofenceId);
      
      // Map backend response to GeofenceArea interface
      const geofence: GeofenceArea = {
        geofence_id: String(responseGeofenceId),
        name: assignedGeofence?.name || 'Unnamed Geofence',
        description: assignedGeofence?.description || '',
        coordinates: coordinates.length > 0 ? coordinates : [],
        center: (center.latitude !== 0 && center.longitude !== 0) ? center : { latitude: 0, longitude: 0 },
        radius: assignedGeofence?.radius,
        active_users_count: assignedGeofence?.active_users_count || 0,
        area_size: assignedGeofence?.area_size || 0,
      };
      
      console.log('[Geofence] Mapped geofence data:', {
        geofence_id: geofence.geofence_id,
        name: geofence.name,
        coordinatesCount: geofence.coordinates?.length || 0,
        hasCenter: !!geofence.center,
        center: geofence.center,
        description: geofence.description
      });
      console.log('[Geofence] Full mapped geofence:', JSON.stringify(geofence, null, 2));
      
      // Validate that we have coordinates
      if (!geofence.coordinates || geofence.coordinates.length === 0) {
        console.warn('[Geofence] WARNING: Mapped geofence has no coordinates!');
        console.warn('[Geofence] Profile response data:', JSON.stringify(response.data, null, 2));
        console.warn('[Geofence] assigned_geofence data:', JSON.stringify(assignedGeofence, null, 2));
      }
      
      return geofence;
    } catch (error: any) {
      console.error('[Geofence] Error fetching geofence:', error);
      if (error?.response) {
        console.error('[Geofence] Error response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  getUsersInArea: async (geofenceId: string) => {
    // Skip API call if disabled
    if (!ENABLE_API_CALLS) {
      // Mock users in area
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        result: 'success',
        data: {
          users: [],
          count: 0,
        },
      };
    }

    const response = await axiosInstance.post(API_ENDPOINTS.GET_USERS_IN_AREA, {
      geofence_id: geofenceId,
    });
    return response.data;
  },
};














