import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-dotenv';

// Determine base URL based on environment
// For local development: http://localhost:8000
// For production: https://safetnet.onrender.com
const getBaseURL = () => {
  // Check if we have a custom API URL in env
  if (Config.API_BASE_URL) {
    return Config.API_BASE_URL;
  }
  
  // Default to production URL
  // To use local development, set API_BASE_URL in .env file:
  // API_BASE_URL=http://localhost:8000
  // Or change the default below
  return 'https://safetnet.onrender.com';  // Production default
  
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

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
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

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.clear();
      // Navigate to login - will be handled by navigation
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;














