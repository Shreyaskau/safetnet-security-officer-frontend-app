import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from 'react-native-dotenv';
import apiConfig from './config';

// Determine base URL - use environment variable or default from config
const getBaseURL = () => {
  // Priority 1: Check environment variable (for deployment flexibility)
  // This allows you to set API_BASE_URL in .env file or build configuration
  if (Config.API_BASE_URL) {
    // Ensure URL ends with /api/security/ if not already included
    let url = Config.API_BASE_URL.trim();
    if (!url.endsWith('/')) {
      url += '/';
    }
    if (!url.includes('/api/security')) {
      url += 'api/security/';
    }
    console.log("Using API_BASE_URL from environment:", url);
    return url;
  }
  
  // Priority 2: Use BASE_URL from config.ts and append /api/security/
  const baseUrl = apiConfig.BASE_URL;
  const apiUrl = `${baseUrl}/api/security/`;
  console.log("Using API URL from config:", apiUrl);
  return apiUrl;
  
  // For local development, create .env file with:
  // API_BASE_URL=http://127.0.0.1:8000/api/security/
  // Or for Android Emulator:
  // API_BASE_URL=http://10.0.2.2:8000/api/security/
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 60000, // Increased timeout for Render (free tier can be slow)
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
export const loginOfficer = async (username: string, password: string) => {
  try {
    // Clear any old tokens before login
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refresh_token");
    
    // Trim whitespace from username and password (common issue)
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    // Log exact values being sent (for debugging)
    console.log("=== LOGIN REQUEST DEBUG ===");
    console.log("Username (raw):", JSON.stringify(username));
    console.log("Username (trimmed):", JSON.stringify(trimmedUsername));
    console.log("Username length:", username.length, "->", trimmedUsername.length);
    console.log("Password length:", password.length, "->", trimmedPassword.length);
    
    // Backend expects 'username' field (can be email or username)
    const requestData = { 
      username: trimmedUsername, 
      password: trimmedPassword 
    };
    
    // Log the exact JSON being sent
    const requestBody = JSON.stringify(requestData);
    console.log("Request Body (JSON):", requestBody);
    console.log("Request Body (parsed):", JSON.parse(requestBody));
    
    // Construct full URL for logging
    const endpoint = "login/"; // No leading slash - axios will combine with baseURL
    const fullUrl = `${apiClient.defaults.baseURL}${endpoint}`;
    console.log("Full URL:", fullUrl);
    console.log("Expected URL:", `${apiConfig.BASE_URL}/api/security/login/`);
    console.log("===========================");
    
    // Make request with explicit headers - use exact endpoint format
    const res = await apiClient.post(endpoint, requestData, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      transformRequest: [(data) => {
        // Ensure data is properly stringified
        const jsonString = JSON.stringify(data);
        console.log("TransformRequest - JSON string:", jsonString);
        return jsonString;
      }],
    });
    
    console.log("Response Status:", res.status);
    console.log("Response Data:", JSON.stringify(res.data, null, 2));
    console.log("Response Headers:", JSON.stringify(res.headers, null, 2));
    console.log("===========================");

    // Django REST API response structure: { access, refresh, user: {...} }
    const responseData = res.data;
    console.log("Login response (parsed):", responseData);
    
    // Validate response structure
    if (!responseData) {
      console.error("ERROR: Response data is null or undefined");
      throw new Error("Invalid response from server - no data received");
    }
    
    // Check if login failed (400 with invalid credentials)
    if (res.status === 400) {
      const errorMessage = (responseData && responseData.non_field_errors && responseData.non_field_errors[0]) || 
                          (responseData && responseData.error) || 
                          (responseData && responseData.detail) ||
                          "Invalid credentials";
      console.error("Login failed:", errorMessage);
      throw new Error(errorMessage);
    }
    
    // Django returns 'access' token (JWT), not 'token'
    const accessToken = (responseData && responseData.access) || (responseData && responseData.token);
    const refreshToken = (responseData && responseData.refresh) ? responseData.refresh : undefined;
    
    // Log token information (without exposing full token)
    if (accessToken) {
      console.log("✅ Access token received:", accessToken.substring(0, 20) + "...");
    } else {
      console.error("❌ Access token NOT found in response");
      console.error("Response keys:", Object.keys(responseData || {}));
      console.error("Full response:", JSON.stringify(responseData, null, 2));
    }
    
    if (!accessToken) {
      console.error("Access token not found in login response:", responseData);
      throw new Error("Access token not found in login response. Please check backend authentication configuration.");
    }
    
    // Validate user data exists
    if (!responseData.user) {
      console.warn("⚠️ User data not found in response, but token received");
      console.warn("Response structure:", Object.keys(responseData));
    } else {
      console.log("✅ User data received:", {
        id: responseData.user.id,
        username: responseData.user.username,
        email: responseData.user.email,
        role: responseData.user.role,
      });
    }

    // Save access token
    await setToken(accessToken);
    
    // Save refresh token if provided
    if (refreshToken) {
      await AsyncStorage.setItem("refresh_token", refreshToken);
    }

    return responseData;
  } catch (error: any) {
    // Enhanced error logging
    console.error("=== LOGIN ERROR DEBUG ===");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    
    if (error.response) {
      // Server responded with error
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // Request made but no response
      console.error("No response received");
      console.error("Request config:", error.config);
      console.error("Request URL:", error.config && error.config.url ? error.config.url : 'unknown');
      console.error("Request baseURL:", error.config && error.config.baseURL ? error.config.baseURL : 'unknown');
      console.error("Full URL attempted:", error.config && error.config.baseURL && error.config.url ? `${error.config.baseURL}${error.config.url}` : 'unknown');
    } else {
      // Error setting up request
      console.error("Error setting up request:", error.message);
    }
    console.error("===========================");
    
    // Enhanced error logging for 400 errors
    if (error.response && error.response.status === 400) {
      console.error("400 Bad Request - Login failed:");
      console.error("Request URL:", error.config && error.config.url ? error.config.url : 'unknown');
      console.error("Request Data:", error.config && error.config.data ? error.config.data : 'unknown');
      console.error("Response Data:", error.response && error.response.data ? error.response.data : 'unknown');
      console.error("Response Status:", error.response && error.response.status ? error.response.status : 'unknown');
      console.error("Full Error:", error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : 'unknown');
      
      // Extract error message from Django REST Framework format
      const backendError = error.response && error.response.data ? error.response.data : null;
      let errorMessage = 'Invalid credentials. Please check your username and password.';
      
      // Handle Django REST Framework error formats
      if (backendError) {
        // Format: { "non_field_errors": ["Invalid credentials."] }
        if (backendError.non_field_errors && Array.isArray(backendError.non_field_errors)) {
          errorMessage = backendError.non_field_errors[0];
        }
        // Format: { "message": "Invalid credentials" }
        else if (backendError.message) {
          errorMessage = backendError.message;
        }
        // Format: { "error": "Invalid credentials" }
        else if (backendError.error) {
          errorMessage = backendError.error;
        }
        // Format: { "detail": "Invalid credentials" }
        else if (backendError.detail) {
          errorMessage = backendError.detail;
        }
        // Format: string
        else if (typeof backendError === 'string') {
          errorMessage = backendError;
        }
      }
      
      const customError = new Error(errorMessage);
      (customError as any).response = error.response;
      (customError as any).status = 400;
      throw customError;
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
