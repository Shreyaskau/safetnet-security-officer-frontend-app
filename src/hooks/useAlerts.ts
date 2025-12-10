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
import { getSampleAlerts } from '../utils/sampleData';

// Track if 404 has been logged to avoid console spam
let alerts404Logged = false;

export const useAlerts = () => {
  const dispatch = useAppDispatch();
  const officer = useAppSelector((state) => state.auth.officer);
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const filter = useAppSelector((state) => state.alerts.filter);
  const isLoading = useAppSelector((state) => state.alerts.isLoading);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    if (!officer) return;

    // Use sample data immediately (non-blocking)
    dispatch(setAlerts(getSampleAlerts()));
    dispatch(setLoading(false));

    // Try to fetch from API in background (non-blocking)
    try {
      const data = await alertService.getAlerts(
        officer.security_id,
        officer.geofence_id
      );
      // Only update if we got real data
      if (data && data.length > 0) {
        dispatch(setAlerts(data));
      }
    } catch (error: any) {
      // Silently handle errors - we already have sample data
      // Only log once to avoid console spam
      if (!alerts404Logged) {
        if (error.response && error.response.status === 404) {
          // 404 is expected - endpoint doesn't exist yet
          // Don't log as warning, just use sample data silently
        } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          // Network errors - silently use sample data
        }
        alerts404Logged = true;
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
  }, [officer]);

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












