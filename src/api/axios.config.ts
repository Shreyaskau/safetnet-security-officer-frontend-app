import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-dotenv';
import apiConfig, { ENABLE_API_CALLS } from './config';

// Determine base URL based on environment
// Priority: .env file > config.ts default
const getBaseURL = () => {
  // Check if we have a custom API URL in env (highest priority)
  if (Config.API_BASE_URL) {
    let url = Config.API_BASE_URL.trim();
    // Remove trailing slash if present
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    // Endpoints already include /api/security/...
    // So if base URL ends with /api, remove it to avoid double /api/api
    if (url.endsWith('/api')) {
      url = url.slice(0, -4); // Remove '/api'
    }
    console.log(`[API Config] Using base URL from .env: ${url}`);
    return url;
  }
  
  // Use the BASE_URL from config.ts
  const baseUrl = apiConfig.BASE_URL;
  console.log(`[API Config] Using base URL from config: ${baseUrl}`);
  return baseUrl;
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 5000, // Reduced from 30000 to 5000ms (5 seconds) for faster failure
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip logging if API calls are disabled
    if (ENABLE_API_CALLS) {
      // Log the request URL for debugging
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
    }
    
    // Try to get token from AsyncStorage (Django JWT format)
    let token = await AsyncStorage.getItem('token');
    
    // Fallback to old storage key for backward compatibility
    if (!token) {
      token = await AsyncStorage.getItem('authToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track logged 404 endpoints to avoid console spam
const logged404Endpoints = new Set<string>();

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Only log if API calls are enabled
    if (ENABLE_API_CALLS) {
      console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    // Handle 404 errors gracefully - don't spam console
    if (error.response && error.response.status === 404) {
      const endpoint = `${error.config?.method?.toUpperCase()} ${error.config?.url}`;
      // Only log 404 once per endpoint
      if (!logged404Endpoints.has(endpoint)) {
        console.warn(`[API] Endpoint not found (404): ${endpoint} - Using fallback data`);
        logged404Endpoints.add(endpoint);
      }
      // Don't log the full HTML response for 404s - it's just noise
    } else if (error.response) {
      // Server responded with error status (non-404)
      console.error(`[API Error] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      // Only log response data if it's not HTML (HTML 404 pages are not useful)
      if (typeof error.response.data === 'string' && error.response.data.includes('<!doctype html>')) {
        // Skip logging HTML error pages
      } else {
        console.error(`[API Error] Response:`, error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error(`[API Network Error] ${error.config?.method?.toUpperCase()} ${error.config?.url || error.config?.baseURL}`);
      console.error(`[API Network Error] No response received. Check if backend is running at: ${error.config?.baseURL}`);
      console.error(`[API Network Error] Full URL: ${error.config?.baseURL}${error.config?.url}`);
      console.error(`[API Network Error] Error details:`, error.message);
    } else {
      // Something else happened
      console.error(`[API Error]`, error.message);
    }
    
    if (error.response && error.response.status === 401) {
      await AsyncStorage.clear();
      // Navigate to login - will be handled by navigation
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;














