import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { alertService } from '../api/services/alertService';
import {
  setAlerts,
  setLoading,
  setError,
  setFilter,
  updateAlert,
} from '../redux/slices/alertSlice';
import { Alert } from '../types/alert.types';

export const useAlerts = () => {
  const dispatch = useAppDispatch();
  const officer = useAppSelector((state) => state.auth.officer);
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const filter = useAppSelector((state) => state.alerts.filter);
  const isLoading = useAppSelector((state) => state.alerts.isLoading);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    if (!officer) return;

    dispatch(setLoading(true));
    try {
      let activeData: Alert[] = [];
      let completedData: Alert[] = [];
      
      // Always fetch both active and completed alerts to ensure accurate stats
      // Try to get numeric geofence_id from profile if officer.geofence_id is empty or a name string
      let geofenceId = officer.geofence_id;
      
      // If geofence_id is empty or not numeric, try to get it from profile
      if (!geofenceId || geofenceId === '' || geofenceId === '0' || isNaN(Number(geofenceId))) {
        try {
          const { profileService } = require('../api/services/profileService');
          const { geofenceService } = require('../api/services/geofenceService');
          const profile = await profileService.getProfile(officer.security_id);
          
          // Try assigned_geofence.id first
          const assignedGeofence = (profile as any)?.assigned_geofence;
          if (assignedGeofence?.id) {
            geofenceId = String(assignedGeofence.id);
            console.log('[useAlerts] ✅ Got numeric geofence_id from assigned_geofence.id:', geofenceId);
          } else {
            // Try fetching geofence details to get numeric ID
            const geofenceName = (profile as any)?.officer_geofence;
            if (geofenceName) {
              try {
                const geofenceDetails = await geofenceService.getGeofenceDetails(geofenceName);
                if (geofenceDetails.geofence_id && !isNaN(Number(geofenceDetails.geofence_id))) {
                  geofenceId = String(geofenceDetails.geofence_id);
                  console.log('[useAlerts] ✅ Got numeric geofence_id from geofence details:', geofenceId);
                }
              } catch (geofenceError) {
                console.warn('[useAlerts] Could not fetch geofence details:', geofenceError);
              }
            }
          }
        } catch (profileError) {
          console.warn('[useAlerts] Could not fetch geofence_id from profile:', profileError);
        }
      }
      
      // Fetch active alerts (pending, accepted, etc.)
      try {
        const activeResponse = await alertService.getAlertLogs(
          officer.security_id,
          'active',
          officer.name
        );
        activeData = Array.isArray(activeResponse) ? activeResponse : (activeResponse.data || []);
      } catch (activeError) {
        console.warn('[useAlerts] Could not fetch active alerts, trying getAlerts:', activeError);
        // Fallback to getAlerts if getAlertLogs fails
        try {
          activeData = await alertService.getAlerts(
            officer.security_id,
            geofenceId || '',
            officer.name
          );
        } catch (fallbackError) {
          console.warn('[useAlerts] Could not fetch active alerts via fallback:', fallbackError);
        }
      }
      
      // Fetch completed alerts
      try {
        const completedResponse = await alertService.getAlertLogs(
          officer.security_id,
          'completed',
          officer.name
        );
        completedData = Array.isArray(completedResponse) ? completedResponse : (completedResponse.data || []);
      } catch (completedError) {
        console.warn('[useAlerts] Could not fetch completed alerts:', completedError);
      }
      
      // Merge active and completed alerts, removing duplicates by log_id or id
      const allAlertsMap = new Map<string | number, Alert>();
      
      // Add active alerts first
      activeData.forEach(alert => {
        const key = alert.log_id || alert.id;
        if (key) {
          allAlertsMap.set(key, alert);
        }
      });
      
      // Add completed alerts (will overwrite if same alert exists in active)
      completedData.forEach(alert => {
        const key = alert.log_id || alert.id;
        if (key) {
          allAlertsMap.set(key, alert);
        }
      });
      
      // Convert map to array
      const mergedData = Array.from(allAlertsMap.values());
      
      console.log('[useAlerts] Fetched alerts summary:', {
        active: activeData.length,
        completed: completedData.length,
        merged: mergedData.length,
        filter: filter
      });
      
      dispatch(setAlerts(mergedData));
      dispatch(setLoading(false));
    } catch (error: any) {
      // On error, set empty array instead of sample data
      dispatch(setAlerts([]));
      dispatch(setLoading(false));
      if (error.response && error.response.status !== 404) {
        dispatch(setError(error.message || 'Failed to fetch alerts'));
      }
    }
  };

  const refreshAlerts = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const acceptAlert = async (alertId: string, estimatedArrival?: number) => {
    if (!officer) return;

    try {
      await alertService.acceptAlert({
        log_id: alertId,
        security_id: officer.security_id,
        estimated_arrival: estimatedArrival,
      });
      await fetchAlerts();
    } catch (error: any) {
      console.error('Error accepting alert:', error);
      throw error;
    }
  };

  const closeAlert = async (alertId: string, status: string) => {
    if (!officer) return;

    try {
      // Update alert status locally immediately for better UX
      const alertToUpdate = alerts.find(a => (a.log_id || a.id) === alertId);
      if (alertToUpdate) {
        dispatch(updateAlert({
          id: alertToUpdate.id || alertId,
          log_id: alertToUpdate.log_id || alertId,
          status: status as 'pending' | 'accepted' | 'completed' | 'cancelled',
          updated_at: new Date().toISOString(),
        }));
      }
      
      // Update on backend
      await alertService.closeAlert(alertId, officer.security_id, status);
      
      // Wait a moment for backend to process, then refresh alerts
      // This ensures the completed alert appears in the completed endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh alerts to get latest data from backend (will fetch both active and completed)
      await fetchAlerts();
    } catch (error: any) {
      console.error('Error closing alert:', error);
      // Revert local update on error by refreshing
      await fetchAlerts();
      throw error;
    }
  };

  const deleteAlert = async (alertId: string | number) => {
    try {
      await alertService.deleteAlert(alertId);
      await fetchAlerts();
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  };

  const changeFilter = (newFilter: typeof filter) => {
    dispatch(setFilter(newFilter));
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') {
      // Show all alerts in "All Alerts" filter
      return true;
    }
    if (filter === 'emergency') {
      // Show high priority alerts (priority === 'high')
      const isHighPriority = alert.priority?.toLowerCase() === 'high';
      
      // Debug logging for troubleshooting
      if (alerts.length > 0 && filter === 'emergency') {
        console.log('[useAlerts] Emergency filter (high priority) check:', {
          alertId: alert.id || alert.log_id,
          priority: alert.priority,
          isHighPriority,
          status: alert.status
        });
      }
      
      return isHighPriority;
    }
    // Make status comparisons case-insensitive to handle 'Completed', 'COMPLETED', 'completed', etc.
    // Also handle 'resolved' as equivalent to 'completed' (backend may use either)
    const alertStatus = alert.status ? String(alert.status).toLowerCase() : '';
    if (filter === 'normal') return alertStatus === 'accepted'; // Accepted alerts (status === 'accepted')
    if (filter === 'pending') return alertStatus === 'pending';
    if (filter === 'completed') return alertStatus === 'completed' || alertStatus === 'resolved';
    return true;
  });
  
  // Debug: Log filtered results when emergency filter is active
  if (filter === 'emergency') {
    console.log('[useAlerts] Emergency filter (high priority) results:', {
      totalAlerts: alerts.length,
      highPriorityAlerts: filteredAlerts.length,
      highPriorityAlertIds: filteredAlerts.map(a => a.id || a.log_id),
      allPriorities: alerts.map(a => ({ id: a.id || a.log_id, priority: a.priority }))
    });
  }

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [officer, filter]); // Add filter as dependency to refetch when filter changes

  return {
    alerts: filteredAlerts,
    allAlerts: alerts,
    isLoading,
    refreshing,
    filter,
    fetchAlerts,
    refreshAlerts,
    acceptAlert,
    closeAlert,
    deleteAlert,
    changeFilter,
  };
};












