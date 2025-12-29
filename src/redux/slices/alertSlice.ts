import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from '../../types/alert.types';

interface AlertState {
  alerts: Alert[];
  activeAlert: Alert | null;
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'emergency' | 'normal' | 'pending' | 'completed';
  unreadCount: number;
}

const initialState: AlertState = {
  alerts: [],
  activeAlert: null,
  isLoading: false,
  error: null,
  filter: 'all',
  unreadCount: 0,
};

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setAlerts: (state, action: PayloadAction<Alert[]>) => {
      state.alerts = action.payload;
      state.isLoading = false;
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload);
      state.unreadCount += 1;
    },
    updateAlert: (state, action: PayloadAction<Alert>) => {
      const alertId = action.payload.id || action.payload.log_id;
      const index = state.alerts.findIndex(a => 
        (a.id === alertId) || (a.log_id === alertId) || 
        (a.id === action.payload.id) || (a.log_id === action.payload.log_id)
      );
      if (index !== -1) {
        state.alerts[index] = action.payload;
      } else {
        // If alert not found, add it (might be a new alert)
        state.alerts.push(action.payload);
      }
    },
    setActiveAlert: (state, action: PayloadAction<Alert | null>) => {
      state.activeAlert = action.payload;
    },
    setFilter: (state, action: PayloadAction<AlertState['filter']>) => {
      state.filter = action.payload;
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAlerts,
  addAlert,
  updateAlert,
  setActiveAlert,
  setFilter,
  clearUnreadCount,
  setLoading,
  setError,
} = alertSlice.actions;

export default alertSlice.reducer;














