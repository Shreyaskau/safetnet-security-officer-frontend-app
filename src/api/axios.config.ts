import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-dotenv';

// Determine base URL based on environment
// For local development: http://localhost:8000
// For production: https://safetnet.site or https://safetnet.onrender.com
const getBaseURL = () => {
  // Check if we have a custom API URL in env
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
    console.log(`[API Config] Using base URL: ${url}`);
    return url;
  }
  
  // Default to production URL (Render backend)
  // To use local development, set API_BASE_URL in .env file:
  // API_BASE_URL=http://localhost:8000
  // Or change the default below
  const defaultUrl = 'https://safetnet-backend.onrender.com';
  console.log(`[API Config] Using default base URL: ${defaultUrl}`);
  return defaultUrl;
  
  // For local development, uncomment and use:
  // return 'http://localhost:8000';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

import { ENABLE_API_CALLS } from './config';

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














