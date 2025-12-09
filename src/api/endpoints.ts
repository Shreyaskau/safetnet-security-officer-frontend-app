export const API_ENDPOINTS = {
  // Auth - Django REST API
  LOGIN: '/api/security/login/',
  LOGOUT: '/api/security/logout/',
  REFRESH_TOKEN: '/api/security/token/refresh/',
  FORGOT_PASSWORD: '/api/security/password-reset/',

  // Alerts - Django REST API
  GET_SECURITY_ALERTS: '/api/security/alerts/',
  GET_ALERT_DETAILS: '/api/security/alerts/{id}/',
  ACCEPT_ALERT: '/api/security/alerts/{id}/accept/',
  CLOSE_ALERT: '/api/security/alerts/{id}/close/',

  // Location - Django REST API
  UPDATE_LOCATION: '/api/security/location/',
  GET_USER_LOCATION: '/api/security/location/',

  // Geofence - Django REST API
  GET_GEOFENCE_DETAILS: '/api/security/geofence/',
  GET_USERS_IN_AREA: '/api/security/geofence/users/',

  // Profile - Django REST API
  GET_PROFILE: '/api/security/profile/',
  UPDATE_PROFILE: '/api/security/profile/',

  // Broadcast - Django REST API
  SEND_BROADCAST: '/api/security/broadcast/',

  // Logs - Django REST API
  GET_LOGS: '/api/security/logs/',

  // Dashboard - Django REST API
  DASHBOARD: '/api/security/dashboard/',

  // Notifications - Django REST API
  NOTIFICATIONS: '/api/security/notifications/',
};














