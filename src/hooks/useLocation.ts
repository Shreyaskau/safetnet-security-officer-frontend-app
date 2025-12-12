import { useState, useEffect, useRef } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { Location } from '../types/location.types';
import { locationService } from '../api/services/locationService';
import { useAppSelector } from '../redux/hooks';
import { useAppDispatch } from '../redux/hooks';
import { setLocation, setLocationError, setTracking } from '../redux/slices/locationSlice';
import { requestLocationPermission } from '../utils/permissions';

export const useLocation = () => {
  const [location, setLocalLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const officer = useAppSelector((state) => state.auth.officer);
  const dispatch = useAppDispatch();
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Request permission and get current location
  const getCurrentLocation = async () => {
    try {
      // Request permission first
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        const errorMessage = 'Location permission denied';
        setError(errorMessage);
        dispatch(setLocationError(errorMessage));
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          // Validate position object
          if (!position || !position.coords) {
            const errorMessage = 'Invalid position data received';
            setError(errorMessage);
            dispatch(setLocationError(errorMessage));
            return;
          }

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
          setError(null);
          dispatch(setLocationError(null));

          // Update server (silently fail on 404 - endpoint may not exist)
          if (officer) {
            locationService.updateLocation(
              officer.security_id,
              newLocation,
              officer.geofence_id
            ).catch((err: any) => {
              // Only log non-404 errors
              if (err?.response?.status !== 404) {
                console.error('Error updating location:', err);
              }
            });
          }
        },
        (error) => {
          const errorMessage = error.message || 'Failed to get current location';
          setError(errorMessage);
          dispatch(setLocationError(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          showLocationDialog: true,
          forceRequestLocation: false,
        }
      );
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to request location permission';
      setError(errorMessage);
      dispatch(setLocationError(errorMessage));
    }
  };

  // Start live location tracking
  const startTracking = async () => {
    try {
      // Request permission first
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        const errorMessage = 'Location permission denied';
        setError(errorMessage);
        dispatch(setLocationError(errorMessage));
        setIsTracking(false);
        dispatch(setTracking(false));
        return;
      }

      // Stop any existing watch
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      watchIdRef.current = Geolocation.watchPosition(
        (position) => {
          // Validate position object
          if (!position || !position.coords) {
            console.error('Invalid position data in watchPosition');
            return;
          }

          const now = Date.now();
          // Throttle updates to server (max once every 5 seconds)
          const shouldUpdateServer = now - lastUpdateTimeRef.current > 5000;

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
          setError(null);
          dispatch(setLocationError(null));

          // Update server (throttled)
          if (officer && shouldUpdateServer) {
            lastUpdateTimeRef.current = now;
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
          const errorMessage = error.message || 'Location tracking error';
          setError(errorMessage);
          dispatch(setLocationError(errorMessage));
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10, // Update every 10 meters
          interval: 5000, // Update every 5 seconds
          fastestInterval: 2000, // Fastest update interval
          showLocationDialog: true,
          forceRequestLocation: false,
        }
      );

      setIsTracking(true);
      dispatch(setTracking(true));
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to start location tracking';
      setError(errorMessage);
      dispatch(setLocationError(errorMessage));
      setIsTracking(false);
      dispatch(setTracking(false));
    }
  };

  // Stop live location tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    dispatch(setTracking(false));
  };

  useEffect(() => {
    // Get initial location
    getCurrentLocation();
    
    // Start live tracking
    startTracking();

    // Cleanup on unmount
    return () => {
      stopTracking();
    };
  }, [officer?.security_id]); // Restart tracking if officer changes

  return {
    location,
    error,
    isTracking,
    getCurrentLocation,
    startTracking,
    stopTracking,
  };
};












