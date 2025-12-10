/**
 * Security Officer API Endpoints
 * Base URL: /api/security/
 * All endpoints are relative to the base URL configured in axios.config.ts
 */
export const API_ENDPOINTS = {
  // ==================== AUTHENTICATION ====================
  LOGIN: '/api/security/login/',
  LOGOUT: '/api/security/logout/', // Not in documented list but keeping for compatibility
  REFRESH_TOKEN: '/api/security/token/refresh/', // Not in documented list but keeping for compatibility
  FORGOT_PASSWORD: '/api/security/password-reset/', // Not in documented list but keeping for compatibility

  // ==================== PROFILE ====================
  GET_PROFILE: '/api/security/profile/',
  UPDATE_PROFILE: '/api/security/profile/', // PATCH

  // ==================== SOS ALERTS ====================
  // Note: These match the documented API - using /sos/ instead of /alerts/
  LIST_SOS: '/api/security/sos/',
  GET_SOS: '/api/security/sos/{id}/',
  UPDATE_SOS: '/api/security/sos/{id}/', // PATCH/PUT
  RESOLVE_SOS: '/api/security/sos/{id}/resolve/', // PATCH
  GET_ACTIVE_SOS: '/api/security/sos/active/',
  GET_RESOLVED_SOS: '/api/security/sos/resolved/',

  // Legacy alerts endpoints (for backward compatibility)
  GET_SECURITY_ALERTS: '/api/security/alerts/', // Maps to /sos/
  GET_ALERT_DETAILS: '/api/security/alerts/{id}/',
  ACCEPT_ALERT: '/api/security/alerts/{id}/accept/',
  CLOSE_ALERT: '/api/security/alerts/{id}/close/',

  // ==================== CASES ====================
  LIST_CASES: '/api/security/case/',
  GET_CASE: '/api/security/case/{id}/',
  CREATE_CASE: '/api/security/case/', // POST
  UPDATE_CASE: '/api/security/case/{id}/', // PATCH/PUT
  UPDATE_CASE_STATUS: '/api/security/case/{id}/update_status/', // PATCH
  ACCEPT_CASE: '/api/security/case/{id}/accept/', // POST
  REJECT_CASE: '/api/security/case/{id}/reject/', // POST
  RESOLVE_CASE: '/api/security/case/{id}/resolve/', // POST

  // ==================== INCIDENTS ====================
  LIST_INCIDENTS: '/api/security/incidents/',
  CREATE_INCIDENT: '/api/security/incidents/', // POST

  // ==================== NOTIFICATIONS ====================
  LIST_NOTIFICATIONS: '/api/security/notifications/',
  ACKNOWLEDGE_NOTIFICATIONS: '/api/security/notifications/acknowledge/', // POST
  
  // Legacy notifications endpoint
  NOTIFICATIONS: '/api/security/notifications/',

  // ==================== DASHBOARD ====================
  DASHBOARD: '/api/security/dashboard/',

  // ==================== NAVIGATION ====================
  NAVIGATION: '/api/security/navigation/',

  // ==================== LIVE LOCATION ====================
  START_LIVE_LOCATION: '/api/security/live_location/', // POST
  GET_LIVE_LOCATION_SESSIONS: '/api/security/live_location/', // GET
  UPDATE_LIVE_LOCATION: '/api/security/live_location/{session_id}/', // PATCH
  STOP_LIVE_LOCATION: '/api/security/live_location/{session_id}/', // DELETE

  // ==================== LEGACY/ADDITIONAL (not in documented API) ====================
  // These are kept for backward compatibility or may be used by frontend
  UPDATE_LOCATION: '/api/security/location/', // May map to live_location
  GET_USER_LOCATION: '/api/security/location/',
  GET_GEOFENCE_DETAILS: '/api/security/geofence/',
  GET_USERS_IN_AREA: '/api/security/geofence/users/',
  SEND_BROADCAST: '/api/security/broadcast/',
  GET_LOGS: '/api/security/logs/', // May map to incidents or cases
};














