// src/api/index.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Config from '../config/backendConfig';

const api = axios.create({
  baseURL: Config.BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token for authentication
api.interceptors.request.use(async (cfg) => {
  const token = await AsyncStorage.getItem('token') || await AsyncStorage.getItem('authToken');
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
}, err => Promise.reject(err));

api.interceptors.response.use(
  res => res,
  err => {
    // Optional: central logging, refresh token attempt, etc.
    // console.warn('API error', err?.response?.status, err?.message);
    return Promise.reject(err);
  }
);

export default api;

