import { useState, useEffect } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { Location } from '../types/location.types';
import { locationService } from '../api/services/locationService';
import { useAppSelector } from '../redux/hooks';
import { useAppDispatch } from '../redux/hooks';
import { setLocation, setLocationError } from '../redux/slices/locationSlice';

export const useLocation = () => {
  const [location, setLocalLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const officer = useAppSelector((state) => state.auth.officer);
  const dispatch = useAppDispatch();

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        };
        setLocalLocation(newLocation);
        dispatch(setLocation(newLocation));

        // Update server
        if (officer) {
          locationService.updateLocation(
            officer.security_id,
            newLocation,
            officer.geofence_id
          ).catch((err) => {
            console.error('Error updating location:', err);
          });
        }
      },
      (error) => {
        const errorMessage = error.message;
        setError(errorMessage);
        dispatch(setLocationError(errorMessage));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const watchPosition = () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setLocalLocation(newLocation);
        dispatch(setLocation(newLocation));

        if (officer) {
          locationService.updateLocation(
            officer.security_id,
            newLocation,
            officer.geofence_id
          ).catch((err) => {
            console.error('Error updating location:', err);
          });
        }
      },
      (error) => {
        setError(error.message);
        dispatch(setLocationError(error.message));
      },
      { enableHighAccuracy: true, distanceFilter: 10 }
    );

    return () => Geolocation.clearWatch(watchId);
  };

  useEffect(() => {
    getCurrentLocation();
    const cleanup = watchPosition();
    return cleanup;
  }, []);

  return { location, error, getCurrentLocation };
};












