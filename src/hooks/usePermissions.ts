import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import {
  requestLocationPermission,
  requestNotificationPermission,
} from '../utils/permissions';

interface PermissionStatus {
  location: boolean;
  notifications: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    location: false,
    notifications: false,
  });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    setIsChecking(true);
    try {
      const [location, notifications] = await Promise.all([
        checkLocationPermission(),
        checkNotificationPermission(),
      ]);

      setPermissions({
        location,
        notifications,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const checkLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return result;
    } else {
      // For iOS, we'd need to check the permission status
      // This is a simplified version
      return false;
    }
  };

  const checkNotificationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return result;
    } else {
      // For iOS, check notification permission
      return false;
    }
  };

  const requestLocation = async (): Promise<boolean> => {
    const granted = await requestLocationPermission();
    setPermissions((prev) => ({ ...prev, location: granted }));
    return granted;
  };

  const requestNotifications = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setPermissions((prev) => ({ ...prev, notifications: granted }));
    return granted;
  };

  const requestAll = async (): Promise<PermissionStatus> => {
    const [location, notifications] = await Promise.all([
      requestLocation(),
      requestNotifications(),
    ]);

    return { location, notifications };
  };

  return {
    permissions,
    isChecking,
    requestLocation,
    requestNotifications,
    requestAll,
    checkAllPermissions,
  };
};












