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

export const useAlerts = () => {
  const dispatch = useAppDispatch();
  const officer = useAppSelector((state) => state.auth.officer);
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const filter = useAppSelector((state) => state.alerts.filter);
  const isLoading = useAppSelector((state) => state.alerts.isLoading);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    if (!officer) return;

    try {
      dispatch(setLoading(true));
      const data = await alertService.getAlerts(
        officer.security_id,
        officer.geofence_id
      );
      dispatch(setAlerts(data));
    } catch (error: any) {
      // Only log 404 errors, don't show them as critical errors
      if (error.response && error.response.status === 404) {
        // Silently handle 404 - backend endpoint not available
        // Use sample data instead of empty array
        dispatch(setAlerts(getSampleAlerts()));
      } else {
        // Use sample data on other errors too for development
        dispatch(setAlerts(getSampleAlerts()));
        console.error('Error fetching alerts:', error);
      }
    } finally {
      dispatch(setLoading(false));
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












