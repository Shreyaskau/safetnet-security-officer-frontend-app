import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  notificationsEnabled: boolean;
  locationTrackingEnabled: boolean;
  onDuty: boolean;
  theme: ThemeMode;
}

const initialState: SettingsState = {
  notificationsEnabled: true,
  locationTrackingEnabled: true,
  onDuty: true,
  theme: 'system',
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
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
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














