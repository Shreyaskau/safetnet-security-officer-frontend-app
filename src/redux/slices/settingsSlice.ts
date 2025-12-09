import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  notificationsEnabled: boolean;
  locationTrackingEnabled: boolean;
  onDuty: boolean;
  theme: 'light' | 'dark';
}

const initialState: SettingsState = {
  notificationsEnabled: true,
  locationTrackingEnabled: true,
  onDuty: true,
  theme: 'light',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
    setLocationTrackingEnabled: (state, action: PayloadAction<boolean>) => {
      state.locationTrackingEnabled = action.payload;
    },
    setOnDuty: (state, action: PayloadAction<boolean>) => {
      state.onDuty = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  setNotificationsEnabled,
  setLocationTrackingEnabled,
  setOnDuty,
  setTheme,
} = settingsSlice.actions;

export default settingsSlice.reducer;














