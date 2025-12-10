import api from './index';

// Authentication
export const login = (email: string, password: string) =>
  api.post('/api/auth/login/', { email, password }).then(r => r.data);

// Profile
export const getProfile = () =>
  api.get('/api/profile/').then(r => r.data);

// Alerts
export const getAlerts = () =>
  api.get('/api/alerts/').then(r => r.data);

