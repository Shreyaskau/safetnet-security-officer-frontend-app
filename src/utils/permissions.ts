import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';
import { request, PERMISSIONS, RESULTS, Permission, checkNotifications, requestNotifications } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

/**
 * Check if device location services (GPS) are enabled
 * Note: This is a best-effort check. The native module might not be available
 * or location might timeout even if GPS is enabled. This function should be
 * used sparingly and not block the user if permission is already granted.
 */
export const isLocationEnabled = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // First check if permission is granted - if not, GPS status doesn't matter
      const permissionGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      
      if (!permissionGranted) {
        // Permission not granted, so we can't check GPS status
        return false;
      }

      // If permission is granted, assume GPS is enabled
      // The actual GPS status will be revealed when trying to get location
      // Trying to check GPS status here often causes false negatives
      return true;
    } else {
      // For iOS, permission request will handle location services check
      return true;
    }
  } catch (error) {
    console.warn('Error checking location services:', error);
    // If check fails, assume enabled rather than blocking the user
    return true;
  }
};

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      // First check if permission is already granted
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      
      if (checkResult) {
        return true;
      }

      // Request permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'SafeTNet needs access to your location to send alerts and track your position',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      
      // If fine location granted, also request coarse location for compatibility
      if (isGranted) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          {
            title: 'Location Permission',
            message: 'SafeTNet also needs approximate location access',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
      }
      
      return isGranted;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  } else {
    const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    return result === RESULTS.GRANTED;
  }
};

/**
 * Request location permission with device location services check
 * Shows helpful alerts if location services are disabled
 */
export const requestLocationPermissionWithCheck = async (showAlerts: boolean = true): Promise<boolean> => {
  if (Platform.OS === 'android') {
    // First check if permission is already granted
    const permissionGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    
    // If permission is already granted, skip the GPS check and return true
    // The GPS check was causing false positives when permission is granted
    if (permissionGranted) {
      return true;
    }
  }

  // Request app permission (if not already granted)
  const hasPermission = await requestLocationPermission();
  
  if (!hasPermission && showAlerts) {
    Alert.alert(
      'Location Permission Required',
      'Please grant location permission to use this feature:\n\n' +
      '1. Go to Device Settings\n' +
      '2. Apps → SafeTNet Security\n' +
      '3. Permissions → Location\n' +
      '4. Select "Allow all the time" or "While using app"\n\n' +
      'Note: Also make sure Location Services (GPS) is enabled in device settings.\n\n' +
      'Then return to the app and try again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings().catch(() => {
              Alert.alert('Error', 'Unable to open settings. Please grant permission manually.');
            });
          }
        }
      ]
    );
    return false;
  }

  // If permission is granted, we'll try to get location
  // If GPS is actually disabled, the location request will fail with a specific error
  // and we can handle it at that point rather than pre-checking
  return hasPermission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'SafeTNet needs to send you emergency alerts',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    // iOS notifications use checkNotifications/requestNotifications, not PERMISSIONS.IOS.NOTIFICATIONS
    const { status } = await requestNotifications(['alert', 'sound', 'badge']);
    return status === RESULTS.GRANTED;
  }
};














