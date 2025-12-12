import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { alertService } from '../api/services/alertService';
import {
  setAlerts,
  setLoading,
  setError,
  setFilter,
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
      let data: Alert[] = [];
      
      // Use appropriate API endpoint based on filter (similar to getAlertLogs)
      // For completed/resolved alerts, use resolved endpoint
      // For active/pending alerts, use active endpoint
      // For all/emergency/normal, use list endpoint
      if (filter === 'completed' || filter === 'resolved') {
        // Use getAlertLogs for completed/resolved alerts
        const response = await alertService.getAlertLogs(
          officer.security_id,
          'completed',
          officer.name
        );
        data = Array.isArray(response) ? response : (response.data || []);
      } else if (filter === 'pending' || filter === 'active') {
        // Use getAlertLogs for active/pending alerts
        const response = await alertService.getAlertLogs(
        officer.security_id,
          'active',
          officer.name
      );
        data = Array.isArray(response) ? response : (response.data || []);
      } else {
        // Use regular getAlerts for all/emergency/normal filters
        data = await alertService.getAlerts(
          officer.security_id,
          officer.geofence_id,
          officer.name // Pass officer name to use for alerts created by this officer
        );
      }
      
      dispatch(setAlerts(data || []));
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
      await alertService.closeAlert(alertId, officer.security_id, status);
      await fetchAlerts();
    } catch (error: any) {
      console.error('Error closing alert:', error);
      throw error;
    }
  };

  const changeFilter = (newFilter: typeof filter) => {
    dispatch(setFilter(newFilter));
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    if (filter === 'emergency') return alert.alert_type === 'emergency';
    if (filter === 'normal') return alert.alert_type === 'normal';
    if (filter === 'pending') return alert.status === 'pending';
    if (filter === 'completed') return alert.status === 'completed';
    return true;
  });

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
    changeFilter,
  };
};












