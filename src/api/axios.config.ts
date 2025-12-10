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
  timeout: 20000, // 20 seconds - Render free tier can take 10-30 seconds to wake up
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from AsyncStorage (minimal logging for login speed)
    const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track logged 404 endpoints to avoid console spam
const logged404Endpoints = new Set<string>();
// Track logged network errors to avoid console spam
const loggedNetworkErrors = new Set<string>();

// Response interceptor - Handle errors (minimal logging for speed)
axiosInstance.interceptors.response.use(
  (response) => {
    // Don't log successful responses (faster, less console noise)
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
      const endpoint = `${error.config?.method?.toUpperCase()} ${error.config?.url || error.config?.baseURL}`;
      // Only log network errors once per endpoint to avoid spam
      if (!loggedNetworkErrors.has(endpoint)) {
        loggedNetworkErrors.add(endpoint);
        console.warn(`[API Network] Connection timeout/error for: ${endpoint}`);
        console.warn(`[API Network] Backend may be sleeping (Render free tier takes 10-30s to wake up)`);
        console.warn(`[API Network] URL: ${error.config?.baseURL}${error.config?.url}`);
        console.warn(`[API Network] Wait 30 seconds and try again, or check Render dashboard`);
      }
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














