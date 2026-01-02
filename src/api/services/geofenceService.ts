import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import { GeofenceArea } from '../../types/location.types';
import { ENABLE_API_CALLS } from '../config';
// Removed mock data and local data fallback imports - using only actual backend data

export const geofenceService = {
  getGeofenceDetails: async (geofenceId: string | number): Promise<GeofenceArea> => {
    // Always use actual backend data - no mock data fallback
    if (!ENABLE_API_CALLS) {
      throw new Error('API calls are disabled. Please enable ENABLE_API_CALLS to use actual backend data.');
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
      
      // Try only the most likely endpoint patterns first
      // Reduced from 14 to 3 most common patterns to reduce warning spam
      const possibleEndpoints: Array<{ url: string; method: 'GET' | 'POST'; data?: any }> = [
        // Pattern 1: GET with ID in path (RESTful) - Most common Django pattern
        { url: `/api/security/geofence/${geofenceIdStr}/`, method: 'GET' },
        
        // Pattern 2: GET without ID (uses JWT token to get current user's geofence)
        { url: `/api/security/geofence/`, method: 'GET' },
        
        // Pattern 3: Alternative path
        { url: `/api/geofence/${geofenceIdStr}/`, method: 'GET' },
      ];
      
      let lastError: any = null;
      let successfulEndpoint: string | null = null;
      
      // Only log first attempt, suppress 404 warnings for subsequent attempts
      let attemptCount = 0;
      
      for (const endpoint of possibleEndpoints) {
        attemptCount++;
        try {
          // Only log first attempt to reduce noise
          if (attemptCount === 1) {
            console.log(`[Geofence] Attempting to fetch geofence via: ${endpoint.method} ${endpoint.url}`);
          }
          
          if (endpoint.method === 'POST' && endpoint.data) {
            response = await axiosInstance.post(endpoint.url, endpoint.data);
          } else {
            response = await axiosInstance.get(endpoint.url);
          }
          
          successfulEndpoint = `${endpoint.method} ${endpoint.url}`;
          console.log(`[Geofence] ✅ Success with ${successfulEndpoint}`);
          break;
        } catch (error: any) {
          lastError = error;
          const status = error?.response?.status;
          // Only log non-404 errors (401, 403, 500, etc.) - suppress 404 warnings
          if (status && status !== 404) {
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
        // Only log summary, not all failed attempts
        console.log('[Geofence] Geofence API endpoints not available, checking profile for geofence data...');
        
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
            // Profile has geofence name but not ID or details
            // Try to fetch geofence by name from backend
            const geofenceName = profileData.officer_geofence;
            console.log('[Geofence] Profile has geofence name:', geofenceName);
            console.log('[Geofence] Attempting to fetch geofence by name from backend...');
            
            try {
              // Try fetching by name from backend
              const nameResponse = await axiosInstance.get(`/api/security/geofence/?name=${encodeURIComponent(geofenceName)}`);
              if (nameResponse.data && (nameResponse.data.id || nameResponse.data.geofence_id)) {
                console.log('[Geofence] ✅ Successfully fetched geofence by name from backend');
                // Process the response the same way as ID-based fetch
                const geofenceData = nameResponse.data.data || nameResponse.data;
                // Continue with normal processing below...
                response = { data: geofenceData };
              } else {
                throw new Error('Geofence not found in backend response');
              }
            } catch (nameError: any) {
              console.error('[Geofence] Failed to fetch geofence by name from backend:', nameError?.response?.status || nameError?.message);
              throw new Error(
                `Geofence "${geofenceName}" is assigned but geofence details are not available from backend. ` +
                `Please ensure GET /api/security/geofence/{id}/ or GET /api/security/geofence/?name={name} endpoint is implemented.`
              );
            }
          } else {
            console.error('[Geofence] Profile does not contain geofence information');
            console.error('[Geofence] Available profile fields:', Object.keys(profileData).join(', '));
            throw new Error(
              `Geofence API endpoint not found and profile has no geofence data. ` +
              `Please implement GET /api/security/geofence/{id}/ endpoint in your backend to fetch geofence details.`
            );
          }
        } catch (profileError: any) {
          // Re-throw if it's already our formatted error, otherwise wrap it
          if (profileError.message && profileError.message.includes('Geofence')) {
            throw profileError;
          }
          console.error('[Geofence] Profile fallback failed:', profileError.message);
          throw new Error(
            `Cannot fetch geofence details. Geofence API endpoints are not available. ` +
            `Please implement GET /api/security/geofence/{id}/ endpoint in your backend.`
          );
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
      
      // Log the assigned_geofence data for debugging
      if (assignedGeofence) {
        console.log('[Geofence] ✅ Found assigned_geofence data:', JSON.stringify(assignedGeofence, null, 2));
      }
      
      // Parse polygon_json if it exists (could be string, GeoJSON object, or array)
      let coordinates: Array<{ latitude: number; longitude: number }> = [];
      if (assignedGeofence?.polygon_json) {
        try {
          // If polygon_json is a string, parse it
          const polygonData = typeof assignedGeofence.polygon_json === 'string'
            ? JSON.parse(assignedGeofence.polygon_json)
            : assignedGeofence.polygon_json;
          
          // Handle GeoJSON format: { type: "Polygon", coordinates: [[[lng, lat], ...]] }
          if (polygonData && typeof polygonData === 'object' && polygonData.type === 'Polygon') {
            // GeoJSON Polygon format: coordinates is array of rings, first ring is outer boundary
            const rings = polygonData.coordinates;
            if (Array.isArray(rings) && rings.length > 0) {
              // Get the first ring (outer boundary)
              const outerRing = rings[0];
              if (Array.isArray(outerRing)) {
                // GeoJSON coordinates are [longitude, latitude]
                coordinates = outerRing.map((coord: any) => {
                  if (Array.isArray(coord) && coord.length >= 2) {
                    return {
                      latitude: coord[1], // GeoJSON has lng first, then lat
                      longitude: coord[0],
                    };
                  }
                  return { latitude: 0, longitude: 0 };
                });
                console.log('[Geofence] ✅ Parsed GeoJSON polygon:', coordinates.length, 'coordinates');
              }
            }
          }
          // Handle simple array format: [[lat, lng], ...] or [[lng, lat], ...]
          else if (Array.isArray(polygonData)) {
            coordinates = polygonData.map((coord: any) => {
              // Handle [lat, lng] or [lng, lat] format
              if (Array.isArray(coord) && coord.length >= 2) {
                // Try to detect format: if first value > 90, it's probably longitude (lng first)
                const isLngFirst = Math.abs(coord[0]) > 90;
                return {
                  latitude: isLngFirst ? coord[1] : coord[0],
                  longitude: isLngFirst ? coord[0] : coord[1],
                };
              }
              // Handle {lat, lng} or {latitude, longitude} format
              return {
                latitude: coord.latitude || coord.lat || 0,
                longitude: coord.longitude || coord.lng || 0,
              };
            });
            console.log('[Geofence] ✅ Parsed array polygon:', coordinates.length, 'coordinates');
          }
          // Handle object format: { coordinates: [...] }
          else if (polygonData.coordinates && Array.isArray(polygonData.coordinates)) {
            const coords = polygonData.coordinates;
            coordinates = coords.map((coord: any) => {
              if (Array.isArray(coord) && coord.length >= 2) {
                const isLngFirst = Math.abs(coord[0]) > 90;
                return {
                  latitude: isLngFirst ? coord[1] : coord[0],
                  longitude: isLngFirst ? coord[0] : coord[1],
                };
              }
              return {
                latitude: coord.latitude || coord.lat || 0,
                longitude: coord.longitude || coord.lng || 0,
              };
            });
            console.log('[Geofence] ✅ Parsed object polygon:', coordinates.length, 'coordinates');
          }
          
          if (coordinates.length === 0) {
            console.warn('[Geofence] ⚠️ Could not parse polygon_json, format not recognized:', typeof polygonData);
          }
        } catch (error) {
          console.error('[Geofence] ❌ Error parsing polygon_json:', error);
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
            // Backend returns center_point as [latitude, longitude]
            // But some APIs might return [longitude, latitude]
            // Check if first value > 90 (likely longitude)
            const isLngFirst = centerData.length >= 2 && Math.abs(centerData[0]) > 90;
            center = {
              latitude: isLngFirst ? centerData[1] : centerData[0],
              longitude: isLngFirst ? centerData[0] : centerData[1],
            };
            console.log('[Geofence] ✅ Parsed center_point:', center);
          } else if (centerData && typeof centerData === 'object') {
            center = {
              latitude: centerData.latitude || centerData.lat || 0,
              longitude: centerData.longitude || centerData.lng || 0,
            };
            console.log('[Geofence] ✅ Parsed center_point object:', center);
          }
        } catch (error) {
          console.error('[Geofence] ❌ Error parsing center_point:', error);
        }
      }
      
      // If no center point found but we have coordinates, calculate center from coordinates
      if ((center.latitude === 0 && center.longitude === 0) && coordinates.length > 0) {
        const sumLat = coordinates.reduce((sum, coord) => sum + coord.latitude, 0);
        const sumLng = coordinates.reduce((sum, coord) => sum + coord.longitude, 0);
        center = {
          latitude: sumLat / coordinates.length,
          longitude: sumLng / coordinates.length,
        };
        console.log('[Geofence] ✅ Calculated center from coordinates:', center);
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














