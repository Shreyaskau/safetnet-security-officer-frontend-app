import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Location } from '../../types/location.types';

interface LocationState {
  currentLocation: Location | null;
  isTracking: boolean;
  error: string | null;
}

const initialState: LocationState = {
  currentLocation: null,
  isTracking: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
      state.error = null;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setLocationError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLocation, setTracking, setLocationError } = locationSlice.actions;
export default locationSlice.reducer;














