import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from 'react-native-dotenv';
import apiConfig from './config';

// Determine base URL - use environment variable or default from config
const getBaseURL = () => {
  // Priority 1: Check environment variable (for deployment flexibility)
  // This allows you to set API_BASE_URL in .env file or build configuration
    if (Config.API_BASE_URL) {
      let url = Config.API_BASE_URL.trim();
    // Remove trailing slash
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
      }
    // Add /api/security if not already included (without trailing slash)
      if (!url.includes('/api/security')) {
      url += '/api/security';
      }
    // Ensure no trailing slash (endpoints will start with /)
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
      console.log(`[API Config] Using base URL from .env: ${url}`);
      return url;
    }
  
  // Priority 2: Use BASE_URL from config.ts and append /api/security (no trailing slash)
  const baseUrl = apiConfig.BASE_URL;
  const apiUrl = `${baseUrl}/api/security`;
  console.log(`[API Config] Using base URL from config: ${apiUrl}`);
  return apiUrl;
  
  // For local development, create .env file with:
  // API_BASE_URL=http://127.0.0.1:8000/api/security
  // Or for Android Emulator:
  // API_BASE_URL=http://10.0.2.2:8000/api/security
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 90000, // 90 seconds - Render free tier can take 30-90s to wake up from sleep
  validateStatus: function (status) {
    return status < 500; // Don't throw error for 4xx status codes
  },
});

// --------------------------------------
// 🔐 REQUEST INTERCEPTOR - Automatically attach token to all requests
// --------------------------------------
apiClient.interceptors.request.use(
  async (config) => {
    // Always ensure Content-Type is set for JSON requests
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    if (!config.headers['Accept']) {
      config.headers['Accept'] = 'application/json';
    }
    
    // Don't add token for login/register endpoints
    const isAuthEndpoint = (config.url && config.url.includes('/login/')) || 
                          (config.url && config.url.includes('/register/')) ||
                          (config.url && config.url.includes('/password-reset/'));
    
    if (!isAuthEndpoint) {
      // Get token from AsyncStorage on every request (except auth endpoints)
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --------------------------------------
// 🔐 RESPONSE INTERCEPTOR - Handle errors (401, 503, etc.)
// --------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response && error.response.status ? error.response.status : undefined;
    
    if (status === 401) {
      // Token expired or invalid - clear storage
      await AsyncStorage.removeItem("token");
      delete apiClient.defaults.headers.common["Authorization"];
      // You can dispatch a logout action here if needed
    } else if (status === 502) {
      // Bad Gateway - Render service is down, sleeping, or starting up
      console.error("=== 502 BAD GATEWAY ERROR ===");
      console.error("Backend service on Render is not responding.");
      console.error("Possible causes:");
      console.error("1. Service is sleeping (Render free tier) - Wait 2-3 minutes");
      console.error("2. Service is starting up - Wait 1-2 minutes");
      console.error("3. Service crashed - Check Render dashboard logs");
      console.error("4. Service is down - Check Render dashboard status");
      console.error("Solution: Wait 2-3 minutes and try again, or check Render dashboard");
      console.error("===========================");
    } else if (status === 503) {
      // Service unavailable - backend is down or overloaded
      console.error("Backend service unavailable (503). Server may be down or overloaded.");
      console.error("Render free tier may be spinning up - wait 2-3 minutes and try again.");
    } else if (status >= 500) {
      // Server errors (500, 502, 503, 504, etc.)
      console.error(`Server error (${status}):`, error.message);
      console.error("Backend service may be down or starting up. Check Render dashboard.");
    } else if (!error.response) {
      // Network error - no response from server
      console.error("=== NETWORK ERROR DEBUG ===");
      console.error("Network error: Unable to reach server.");
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Request URL:", error.config && error.config.url ? error.config.url : 'unknown');
      console.error("Base URL:", error.config && error.config.baseURL ? error.config.baseURL : 'unknown');
      console.error("Full URL attempted:", error.config && error.config.baseURL && error.config.url ? `${error.config.baseURL}${error.config.url}` : 'unknown');
      console.error("Possible causes:");
      console.error("1. Backend server is down or spinning up (Render free tier takes 2-3 min)");
      console.error("2. Network connectivity issue");
      console.error("3. CORS issue (check backend CORS settings)");
      console.error("4. SSL/HTTPS certificate issue");
      console.error("5. Firewall blocking the connection");
      console.error("===========================");
    }
    
    return Promise.reject(error);
  }
);

// --------------------------------------
// 🔐 SET TOKEN (Called after login)
// --------------------------------------
export const setToken = async (token: string) => {
  if (!token || token === 'undefined' || token === 'null') {
    console.error("Attempted to set invalid token:", token);
    throw new Error("Cannot set invalid token");
  }
  
  await AsyncStorage.setItem("token", token);
  // Also set in defaults for immediate use
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// --------------------------------------
// 🔐 GET TOKEN (Helper function)
// --------------------------------------
export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("token");
};

// --------------------------------------
// 🔐 CLEAR TOKEN (Called on logout)
// --------------------------------------
export const clearToken = async () => {
  await AsyncStorage.removeItem("token");
  delete apiClient.defaults.headers.common["Authorization"];
};

// --------------------------------------
// 🔐 INITIALIZE TOKEN (Call on app start to restore token)
// --------------------------------------
export const initializeToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  return token;
};

// --------------------------------------
// 🔐 LOGIN API (You just added this in backend)
// --------------------------------------
export const loginOfficer = async (username: string, password: string, retryCount: number = 0): Promise<any> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [2000, 5000, 10000]; // 2s, 5s, 10s delays
  
  try {
    // Log the base URL for debugging
    const baseURL = apiClient.defaults.baseURL;
    if (retryCount === 0) {
      console.log(`[Login] Attempting to connect to: ${baseURL}/login/`);
    } else {
      console.log(`[Login] Retry attempt ${retryCount}/${MAX_RETRIES}...`);
    }
    
    // Trim whitespace and prepare request
    const requestData = { 
      username: username.trim(), 
      password: password.trim()
    };
    
    // Make API request - use longer timeout for Render free tier
    const endpoint = "/login/";
    const res = await apiClient.post(endpoint, requestData, {
      timeout: 120000, // 120 seconds - Render free tier can take up to 2-3 minutes to wake up
    });

    const responseData = res.data;
    
    // Check for login failure
    if (res.status === 400) {
      const errorMessage = responseData?.non_field_errors?.[0] || 
                          responseData?.error || 
                          responseData?.detail ||
                          "Invalid credentials";
      throw new Error(errorMessage);
    }
    
    // Extract tokens
    const accessToken = responseData?.access || responseData?.token;
    const refreshToken = responseData?.refresh;
    
    if (!accessToken) {
      throw new Error("Access token not received from server");
    }
    
    // Save tokens in background (non-blocking) - return immediately
    setToken(accessToken).catch(() => {}); // Fire and forget
    if (refreshToken) {
      AsyncStorage.setItem("refresh_token", refreshToken).catch(() => {}); // Fire and forget
    }

    return responseData;
  } catch (error: any) {
    // Check if it's a network error and we should retry
    const isNetworkError = !error.response && (
      error.code === 'ERR_NETWORK' || 
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout')
    );
    
    // Retry logic for network errors (Render free tier wake-up)
    if (isNetworkError && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] || 10000;
      console.log(`[Login] Network error detected. Retrying in ${delay/1000}s... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return loginOfficer(username, password, retryCount + 1);
    }
    
    // Handle response errors
    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        const errorMsg = error.response.data?.non_field_errors?.[0] || 
                        error.response.data?.error || 
                        error.response.data?.detail ||
                        "Invalid credentials";
        throw new Error(errorMsg);
      } else if (status >= 500) {
        throw new Error("Server error. Please try again later.");
      }
    }
    
    // Handle network errors after retries exhausted
    if (isNetworkError) {
      throw new Error(
        "Unable to connect to server. " +
        "The backend service may be starting up (Render free tier takes 2-3 minutes). " +
        "Please wait a moment and try again."
      );
    }
    
    throw error;
  }
};

// --------------------------------------
// 🆘 SOS APIS
// --------------------------------------
export const listSOS = () => apiClient.get("/sos/");
export const getSOS = (id: number | string) => apiClient.get(`/sos/${id}/`);
export const createSOS = (data: any) => apiClient.post("/sos/", data);
export const updateSOS = (id: number | string, data: any) =>
  apiClient.put(`/sos/${id}/`, data);
export const patchSOS = (id: number | string, data: any) =>
  apiClient.patch(`/sos/${id}/`, data);
export const deleteSOS = (id: number | string) =>
  apiClient.delete(`/sos/${id}/`);
export const resolveSOS = (id: number | string) =>
  apiClient.patch(`/sos/${id}/resolve/`);
export const getActiveSOS = () => apiClient.get("/sos/active/");
export const getResolvedSOS = () => apiClient.get("/sos/resolved/");

// --------------------------------------
// 📁 CASE APIS
// --------------------------------------
export const listCases = () => apiClient.get("/case/");
export const getCase = (id: number | string) => apiClient.get(`/case/${id}/`);
export const createCase = (data: any) => apiClient.post("/case/", data);
export const updateCase = (id: number | string, data: any) =>
  apiClient.put(`/case/${id}/`, data);
export const patchCase = (id: number | string, data: any) =>
  apiClient.patch(`/case/${id}/`, data);
export const deleteCase = (id: number | string) =>
  apiClient.delete(`/case/${id}/`);
export const acceptCase = (id: number | string) =>
  apiClient.post(`/case/${id}/accept/`);
export const rejectCase = (id: number | string) =>
  apiClient.post(`/case/${id}/reject/`);
export const resolveCase = (id: number | string) =>
  apiClient.post(`/case/${id}/resolve/`);

// --------------------------------------
// 🔄 TOKEN REFRESH
// --------------------------------------
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const res = await apiClient.post("/token/refresh/", { refresh: refreshToken });
    const newAccessToken = res.data && res.data.access ? res.data.access : null;
    
    if (newAccessToken) {
      await setToken(newAccessToken);
      return newAccessToken;
    }
    
    throw new Error("No access token in refresh response");
  } catch (error: any) {
    console.error("Token refresh failed:", error);
    // Clear tokens on refresh failure
    await clearToken();
    await AsyncStorage.removeItem("refresh_token");
    throw error;
  }
};

// --------------------------------------
// 🧭 NAVIGATION
// --------------------------------------
export const getNavigation = () => apiClient.get("/navigation/");

// --------------------------------------
// 📜 INCIDENTS
// --------------------------------------
export const listIncidents = () => apiClient.get("/incidents/");

// --------------------------------------
// 🔍 CONNECTION TEST
// --------------------------------------
/**
 * Test backend connection
 * Returns true if connection is successful, false otherwise
 */
export const testConnection = async (): Promise<{ success: boolean; message: string; url?: string }> => {
  try {
    const baseURL = apiClient.defaults.baseURL;
    const testUrl = `${baseURL}/login/`;
    
    console.log(`[Connection Test] Testing: ${testUrl}`);
    
    // Try a simple GET request (will likely return 405 Method Not Allowed, but that means server is reachable)
    const response = await apiClient.get("/login/", {
      timeout: 10000, // 10 second timeout for connection test
      validateStatus: () => true, // Accept any status code
    });
    
    // If we get any response (even 405), server is reachable
    if (response.status !== undefined) {
      return {
        success: true,
        message: `Server is reachable (Status: ${response.status})`,
        url: testUrl,
      };
    }
    
    return {
      success: false,
      message: "Server responded but with unexpected format",
      url: testUrl,
    };
  } catch (error: any) {
    const baseURL = apiClient.defaults.baseURL;
    const testUrl = `${baseURL}/login/`;
    
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return {
        success: false,
        message: `Cannot reach server at ${testUrl}. Check if URL is correct and server is running.`,
        url: testUrl,
      };
    }
    
    return {
      success: false,
      message: error.message || "Connection test failed",
      url: testUrl,
    };
  }
};
